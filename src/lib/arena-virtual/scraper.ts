import { ArenaPlayer, ArenaNegotiation, ArenaApiPlayer, ArenaApiSearchResult } from "@/types";
import { getCache, setCache } from "../cache";

const BASE_URL =
  process.env.ARENA_VIRTUAL_BASE_URL ||
  "https://arenavirtual.arenavirtual.net";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
};

let sessionCookies: string | null = null;
let userHash: string | null = null;

function mergeCookies(existing: string | null, setCookieHeaders: string[]): string {
  const parsed = setCookieHeaders.map((c) => c.split(";")[0]);
  if (!existing) return parsed.join("; ");
  const cookieMap = new Map<string, string>();
  for (const cookie of existing.split("; ")) {
    const eqIdx = cookie.indexOf("=");
    if (eqIdx > 0) cookieMap.set(cookie.substring(0, eqIdx), cookie);
  }
  for (const cookie of parsed) {
    const eqIdx = cookie.indexOf("=");
    if (eqIdx > 0) cookieMap.set(cookie.substring(0, eqIdx), cookie);
  }
  return Array.from(cookieMap.values()).join("; ");
}

async function fetchWithSession(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    ...HEADERS,
    ...(options.headers as Record<string, string>),
  };

  if (sessionCookies) {
    headers["Cookie"] = sessionCookies;
  }

  const res = await fetch(url, { ...options, headers });

  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length > 0) {
    sessionCookies = mergeCookies(sessionCookies, setCookie);
  }

  return res;
}

async function apiGet<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (userHash) {
    headers["hash"] = userHash;
  }
  const res = await fetchWithSession(`${BASE_URL}${path}`, { headers });
  if (!res.ok) return null;
  const contentType = res.headers.get("Content-Type") || "";
  if (!contentType.includes("json")) return null;
  return res.json();
}

export async function login(): Promise<boolean> {
  const username = process.env.ARENA_VIRTUAL_USERNAME;
  const password = process.env.ARENA_VIRTUAL_PASSWORD;

  if (!username || !password) {
    console.error("Arena Virtual credentials not configured");
    return false;
  }

  try {
    // Step 1: Fetch homepage to get session cookies + CSRF token
    const homeRes = await fetchWithSession(BASE_URL);
    const homeHtml = await homeRes.text();

    let csrfToken = "";
    const metaMatch = homeHtml.match(
      /<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i
    );
    const inputMatch = homeHtml.match(
      /name=["']_token["']\s+value=["']([^"']+)["']/i
    );
    if (metaMatch) csrfToken = metaMatch[1];
    else if (inputMatch) csrfToken = inputMatch[1];

    // Step 2: POST login with correct form field names
    const loginRes = await fetchWithSession(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
        Referer: BASE_URL,
        Origin: BASE_URL,
      },
      body: new URLSearchParams({
        _token: csrfToken,
        login: username,
        password: password,
      }).toString(),
      redirect: "manual",
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      userHash = loginData.hash_login || null;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Login failed:", err);
    return false;
  }
}

async function ensureSession(): Promise<void> {
  if (!sessionCookies || !userHash) {
    await login();
  }
}

export async function searchPlayers(
  query: string
): Promise<ArenaPlayer[]> {
  const cacheKey = `arena:search:${query}`;
  const cached = getCache<ArenaPlayer[]>(cacheKey, 5 * 60 * 1000);
  if (cached) return cached;

  await ensureSession();

  try {
    const data = await apiGet<{ data: ArenaApiSearchResult[] }>(
      `/pcontrole/api/jogadores?q=${encodeURIComponent(query)}`
    );
    if (!data?.data) {
      return [];
    }

    const players: ArenaPlayer[] = data.data.map((p) => ({
      id: p.id,
      name: p.nome,
      slug: p.nome.toLowerCase().replace(/\s+/g, "-"),
      position: p.posicao,
      age: 0,
      nationality: p.nacionalidade || "",
      nationalityFlag: p.nacionalidade_flag || "",
      photoUrl: p.foto,
      teamId: null,
      teamName: p.nome_escudo || null,
      teamBadge: p.link_escudo || null,
      value: parseFloat(p.passe.replace(/\./g, "").replace(",", ".")) || 0,
      status: p.nome_escudo === "Sem Clube(Sistema)" ? "free" : "donated",
      sofifaId: p.id,
    }));

    setCache(cacheKey, players);
    return players;
  } catch (err) {
    console.error("Search failed:", err);
    return [];
  }
}

export async function getPlayerDetail(
  playerId: number
): Promise<ArenaPlayer | null> {
  const cacheKey = `arena:player:${playerId}`;
  const cached = getCache<ArenaPlayer>(cacheKey, 60 * 60 * 1000);
  if (cached) return cached;

  await ensureSession();

  try {
    const data = await apiGet<{ data: ArenaApiPlayer }>(
      `/pcontrole/api/jogadores/${playerId}`
    );
    if (!data?.data) {
      return null;
    }

    const p = data.data;
    const player: ArenaPlayer = {
      id: p.id,
      name: p.nome,
      slug: p.slug || p.nome.toLowerCase().replace(/\s+/g, "-"),
      position: p.posicao,
      age: p.idade,
      nationality: p.nacionalidade,
      nationalityFlag: `https://cdn.arenavirtual.net/images/paises/${p.pais_id}.png`,
      photoUrl: p.foto,
      teamId: null,
      teamName: p.nome_escudo || null,
      teamBadge: p.link_escudo || null,
      value: parseFloat(p.passe.replace(/\./g, "").replace(",", ".")) || 0,
      status:
        p.nome_escudo === "Sem Clube(Sistema)"
          ? "free"
          : p.nome_escudo
          ? "donated"
          : "unknown",
      sofifaId: p.id,
    };

    setCache(cacheKey, player);
    return player;
  } catch (err) {
    console.error(`Failed to fetch player ${playerId}:`, err);
    return null;
  }
}

export async function getArenaApiPlayer(
  playerId: number
): Promise<ArenaApiPlayer | null> {
  const cacheKey = `arena:api:player:${playerId}`;
  const cached = getCache<ArenaApiPlayer>(cacheKey, 60 * 60 * 1000);
  if (cached) return cached;

  await ensureSession();

  try {
    const data = await apiGet<{ data: ArenaApiPlayer }>(
      `/pcontrole/api/jogadores/${playerId}`
    );
    if (!data?.data) return null;
    setCache(cacheKey, data.data);
    return data.data;
  } catch (err) {
    console.error(`Failed to fetch API player ${playerId}:`, err);
    return null;
  }
}

export async function getRecentNegotiations(): Promise<ArenaNegotiation[]> {
  const cacheKey = "arena:negotiations";
  const cached = getCache<ArenaNegotiation[]>(cacheKey, 5 * 60 * 1000);
  if (cached) return cached;

  await ensureSession();

  try {
    const headers: Record<string, string> = {
      "X-Requested-With": "XMLHttpRequest",
    };
    if (userHash) headers["hash"] = userHash;

    const res = await fetchWithSession(
      `${BASE_URL}/negociacao/historico?showLoadingBrowser=0&page=0&tipo=3&pagination_simple=1`,
      { headers }
    );

    if (!res.ok) return [];

    const contentType = res.headers.get("Content-Type") || "";
    if (!contentType.includes("json")) return [];

    const raw = await res.json();
    const items = raw.data || raw;

    if (!Array.isArray(items)) return [];

    const negotiations: ArenaNegotiation[] = items.map(
      (n: Record<string, unknown>) => {
        const jogador = n.jogador as Record<string, unknown> | undefined;
        return {
          playerName: (jogador?.nome as string) || "",
          playerId: (jogador?.id as number) || 0,
          date: (n.created_at as string) || "",
          fromTeam: (n.origem as string) || (n.nome_escudo_origem as string) || "",
          fromTeamBadge: (n.link_escudo_origem as string) || "",
          toTeam: (n.destino as string) || (n.nome_escudo_destino as string) || "",
          toTeamBadge: (n.link_escudo_destino as string) || "",
          value: 0,
          type: "compra" as const,
        };
      }
    );

    setCache(cacheKey, negotiations);
    return negotiations;
  } catch (err) {
    console.error("Failed to fetch negotiations:", err);
    return [];
  }
}

export async function getTeamPlayers(
  teamId: number
): Promise<ArenaPlayer[]> {
  const cacheKey = `arena:team:${teamId}`;
  const cached = getCache<ArenaPlayer[]>(cacheKey, 15 * 60 * 1000);
  if (cached) return cached;

  await ensureSession();

  try {
    const data = await apiGet<{ data: ArenaApiSearchResult[] }>(
      `/pcontrole/api/jogadores?time_id=${teamId}`
    );
    if (!data?.data) {
      return [];
    }

    const players: ArenaPlayer[] = data.data.map((p) => ({
      id: p.id,
      name: p.nome,
      slug: p.nome.toLowerCase().replace(/\s+/g, "-"),
      position: p.posicao,
      age: 0,
      nationality: p.nacionalidade || "",
      nationalityFlag: p.nacionalidade_flag || "",
      photoUrl: p.foto,
      teamId,
      teamName: p.nome_escudo || null,
      teamBadge: p.link_escudo || null,
      value: parseFloat(p.passe.replace(/\./g, "").replace(",", ".")) || 0,
      status: "donated",
      sofifaId: p.id,
    }));

    setCache(cacheKey, players);
    return players;
  } catch (err) {
    console.error(`Failed to fetch team ${teamId}:`, err);
    return [];
  }
}

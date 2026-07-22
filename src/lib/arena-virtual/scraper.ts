import * as cheerio from "cheerio";
import { ArenaPlayer, ArenaNegotiation } from "@/types";
import { getCache, setCache } from "../cache";

const BASE_URL =
  process.env.ARENA_VIRTUAL_BASE_URL ||
  "https://arenavirtual.arenavirtual.net";

let sessionCookies: string | null = null;

async function fetchWithSession(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    ...(options.headers as Record<string, string>),
  };

  if (sessionCookies) {
    headers["Cookie"] = sessionCookies;
  }

  const res = await fetch(url, { ...options, headers });

  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length > 0) {
    const newCookies = setCookie
      .map((c) => c.split(";")[0])
      .join("; ");
    if (sessionCookies) {
      const existing = new Set(
        sessionCookies.split("; ").map((c) => c.split("=")[0])
      );
      const merged = [sessionCookies];
      for (const cookie of setCookies(setCookie)) {
        if (!existing.has(cookie.split("=")[0])) {
          merged.push(cookie);
        }
      }
      sessionCookies = merged.join("; ");
    } else {
      sessionCookies = newCookies;
    }
  }

  return res;
}

function setCookies(setCookieHeaders: string[]): string[] {
  return setCookieHeaders.map((c) => c.split(";")[0]);
}

export async function login(): Promise<boolean> {
  const username = process.env.ARENA_VIRTUAL_USERNAME;
  const password = process.env.ARENA_VIRTUAL_PASSWORD;

  if (!username || !password) {
    console.error("Arena Virtual credentials not configured");
    return false;
  }

  try {
    const loginUrl = `${BASE_URL}/login`;
    const res = await fetchWithSession(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: username,
        password,
      }).toString(),
      redirect: "manual",
    });

    if (res.status === 302 || res.status === 200) {
      return true;
    }
    return false;
  } catch (err) {
    console.error("Login failed:", err);
    return false;
  }
}

async function ensureSession(): Promise<void> {
  if (!sessionCookies) {
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
    const url = `${BASE_URL}/jogador?q=${encodeURIComponent(query)}`;
    const res = await fetchWithSession(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const players: ArenaPlayer[] = [];

    $(".player-card, .card-jogador, [class*='jogador']").each((_, el) => {
      const $el = $(el);
      const link = $el.find("a[href*='/jogador/']").attr("href") || "";
      const idMatch = link.match(/\/jogador\/(\d+)\//);
      const name = $el.find(".player-name, .nome-jogador, h3, h4").first().text().trim();
      const position = $el.find(".position, .posicao").first().text().trim();
      const teamBadge = $el.find("img[alt*='escudo']").attr("src") || null;
      const photo = $el.find("img[src*='jogadores']").attr("src") || "";

      if (idMatch && name) {
        players.push({
          id: parseInt(idMatch[1]),
          name,
          slug: link.split("/").pop() || "",
          position: position || "N/A",
          age: 0,
          nationality: "",
          nationalityFlag: "",
          photoUrl: photo,
          teamId: null,
          teamName: null,
          teamBadge,
          value: 0,
          status: "unknown",
          sofifaId: parseInt(idMatch[1]),
        });
      }
    });

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
    const url = `${BASE_URL}/jogador/${playerId}`;
    const res = await fetchWithSession(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const name = $("h1, .player-name, .nome-jogador").first().text().trim();
    const position = $(".position, .posicao, .player-position").first().text().trim();
    const photo = $("img[src*='jogadores']").first().attr("src") || "";
    const ageText = $("span:contains('anos'), .age, .idade").first().text().trim();
    const age = parseInt(ageText.replace(/\D/g, "")) || 0;

    const teamImg = $("img[alt*='escudo'], img[src*='escudos']").first();
    const teamName = teamImg.attr("alt") || null;
    const teamBadge = teamImg.attr("src") || null;

    const valueText = $(".value, .valor, [class*='valor']")
      .first()
      .text()
      .replace(/\D/g, "") || "0";
    const value = parseInt(valueText) || 0;

    const nationalityImg = $("img[src*='paises']").first();
    const nationality = nationalityImg.attr("alt") || "";
    const nationalityFlag = nationalityImg.attr("src") || "";

    const isFree = /livre|sem clube/i.test(html);
    const hasNegotiation = /negociação|em negociação/i.test(html);

    const player: ArenaPlayer = {
      id: playerId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      position: position || "N/A",
      age,
      nationality,
      nationalityFlag,
      photoUrl: photo,
      teamId: null,
      teamName: teamName === "Livre" ? null : teamName,
      teamBadge,
      value,
      status: isFree ? "free" : hasNegotiation ? "negotiation" : teamName ? "donated" : "unknown",
      sofifaId: playerId,
    };

    setCache(cacheKey, player);
    return player;
  } catch (err) {
    console.error(`Failed to fetch player ${playerId}:`, err);
    return null;
  }
}

export async function getRecentNegotiations(): Promise<ArenaNegotiation[]> {
  const cacheKey = "arena:negotiations";
  const cached = getCache<ArenaNegotiation[]>(cacheKey, 5 * 60 * 1000);
  if (cached) return cached;

  await ensureSession();

  try {
    const url = `${BASE_URL}/`;
    const res = await fetchWithSession(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const negotiations: ArenaNegotiation[] = [];

    $(
      ".negociacao-card, [class*='negociac'], .card-negociacao"
    ).each((_, el) => {
      const $el = $(el);
      const playerName = $el.find(".player-name, h3, h4").first().text().trim();
      const date = $el.find(".date, .data").first().text().trim();
      const fromBadge = $el.find("img[alt*='escudo']").eq(0).attr("alt") || "";
      const toBadge = $el.find("img[alt*='escudo']").eq(1).attr("alt") || "";
      const valueText = $el
        .find("[class*='valor']")
        .first()
        .text()
        .replace(/[^\d.,]/g, "")
        .replace(".", "")
        .replace(",", ".") || "0";

      const typeText = $el.text().toLowerCase();
      let type: ArenaNegotiation["type"] = "compra";
      if (typeText.includes("troca")) type = "troca";
      else if (typeText.includes("empréstimo") || typeText.includes("emprestimo"))
        type = "emprestimo";
      else if (typeText.includes("demissão") || typeText.includes("demissao"))
        type = "demissao";
      else if (typeText.includes("devolução") || typeText.includes("devolucao"))
        type = "devolucao";

      if (playerName) {
        negotiations.push({
          playerName,
          playerId: 0,
          date,
          fromTeam: fromBadge,
          fromTeamBadge: "",
          toTeam: toBadge,
          toTeamBadge: "",
          value: parseFloat(valueText) || 0,
          type,
        });
      }
    });

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
    const url = `${BASE_URL}/time/${teamId}`;
    const res = await fetchWithSession(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const players: ArenaPlayer[] = [];

    $(".player-card, .card-jogador, [class*='jogador']").each((_, el) => {
      const $el = $(el);
      const link = $el.find("a[href*='/jogador/']").attr("href") || "";
      const idMatch = link.match(/\/jogador\/(\d+)\//);
      const name = $el.find(".player-name, h3, h4").first().text().trim();
      const position = $el.find(".position, .posicao").first().text().trim();
      const photo = $el.find("img[src*='jogadores']").attr("src") || "";

      if (idMatch && name) {
        players.push({
          id: parseInt(idMatch[1]),
          name,
          slug: link.split("/").pop() || "",
          position: position || "N/A",
          age: 0,
          nationality: "",
          nationalityFlag: "",
          photoUrl: photo,
          teamId,
          teamName: null,
          teamBadge: null,
          value: 0,
          status: "donated",
          sofifaId: parseInt(idMatch[1]),
        });
      }
    });

    setCache(cacheKey, players);
    return players;
  } catch (err) {
    console.error(`Failed to fetch team ${teamId}:`, err);
    return [];
  }
}

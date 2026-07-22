import { SofifaPlayer } from "@/types";
import { getCache, setCache } from "../cache";

const SOFIFA_BASE = "https://sofifa.com";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function parseStats(html: string): SofifaPlayer["stats"] {
  const stats = { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 };
  const labels = ["pac", "sho", "pas", "dri", "def", "phy"];
  const keys = Object.keys(stats) as (keyof typeof stats)[];

  for (let i = 0; i < keys.length; i++) {
    const regex = new RegExp(
      `<span[^>]*>\\s*${labels[i]}\\s*</span>\\s*<span[^>]*>(\\d+)</span>`,
      "i"
    );
    const match = html.match(regex);
    if (match) stats[keys[i]] = parseInt(match[1]);
  }

  if (Object.values(stats).every((v) => v === 0)) {
    const statRegex = /<li[^>]*>.*?<span[^>]*>.*?(\d+).*?<\/span>.*?<span[^>]*>.*?(\d+).*?<\/span>/gi;
    let match;
    let idx = 0;
    while ((match = statRegex.exec(html)) && idx < keys.length) {
      stats[keys[idx]] = parseInt(match[2]) || 0;
      idx++;
    }
  }

  return stats;
}

function parseSofifaPage(html: string): SofifaPlayer | null {
  const idMatch = html.match(/\/player\/(\d+)\//);
  if (!idMatch) return null;

  const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const fullNameMatch = html.match(/<p[^>]*class="[^"]*text-ellipsis[^"]*"[^>]*>([^<]+)<\/p>/);

  const positions: string[] = [];
  const posRegex = /<div[^>]*>.*?<button[^>]*>([A-Z]{2,3})<\/button>/gi;
  let posMatch;
  while ((posMatch = posRegex.exec(html))) {
    positions.push(posMatch[1]);
  }

  if (positions.length === 0) {
    const altPosRegex = /<span[^>]*>([A-Z]{2,3})<\/span>/g;
    let altMatch;
    while ((altMatch = altPosRegex.exec(html))) {
      if (["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"].includes(altMatch[1])) {
        positions.push(altMatch[1]);
      }
    }
  }

  const ovrMatch = html.match(/<div[^>]*>.*?<div[^>]*>.*?(\d+).*?<\/div>.*?<div[^>]*>\s*Overall\s*<\/div>/is);
  const potMatch = html.match(/<div[^>]*>.*?<div[^>]*>.*?(\d+).*?<\/div>.*?<div[^>]*>\s*Potential\s*<\/div>/is);

  const heightMatch = html.match(/(\d+)'\s*(\d+)"/);
  const weightMatch = html.match(/(\d+)\s*lbs/);
  const ageMatch = html.match(/Age\s*<[^>]*>\s*(\d+)/i) || html.match(/(\d+)\s*years?/i);

  const footMatch = html.match(/Foot\s*<\/dt>\s*<dd[^>]*>\s*([^<]+)/i);
  const weakFootMatch = html.match(/Weak Foot\s*.*?(\d)/is);
  const skillMovesMatch = html.match(/Skill Moves\s*.*?(\d)/is);

  const workrateAttMatch = html.match(/Attacking Work Rate\s*<\/dt>\s*<dd[^>]*>\s*([^<]+)/i);
  const workrateDefMatch = html.match(/Defensive Work Rate\s*<\/dt>\s*<dd[^>]*>\s*([^<]+)/i);

  const clubMatch = html.match(/<a[^>]*href="\/team\/(\d+)\/[^"]*"[^>]*>([^<]+)<\/a>/);
  const nationMatch = html.match(/<a[^>]*href="\/nation\/(\d+)\/[^"]*"[^>]*>([^<]+)<\/a>/);

  const valueMatch = html.match(/Value\s*<\/dt>\s*<dd[^>]*>\s*([^<]+)/i);
  const wageMatch = html.match(/Wage\s*<\/dt>\s*<dd[^>]*>\s*([^<]+)/i);
  const clauseMatch = html.match(/Release Clause\s*<\/dt>\s*<dd[^>]*>\s*([^<]+)/i);

  const headshotMatch = html.match(/<img[^>]*src="(https:\/\/cdn\.sofifa\.com\/players\/[^"]+)"/);
  const nationImgMatch = html.match(/<img[^>]*src="(https:\/\/cdn\.sofifa\.com\/flags\/[^"]+)"/);
  const teamImgMatch = html.match(/<img[^>]*src="(https:\/\/cdn\.sofifa\.com\/teams\/[^"]+)"/);

  const playStyles: string[] = [];
  const psRegex = /PlayStyle\s*(?:Plus|Ps)?\s*<\/[^>]+>\s*<[^>]+>\s*([^<]+)/gi;
  let psMatch;
  while ((psMatch = psRegex.exec(html))) {
    const style = psMatch[1].trim();
    if (style && style.length > 2) playStyles.push(style);
  }

  return {
    id: parseInt(idMatch[1]),
    name: nameMatch?.[1]?.trim() || "",
    fullName: fullNameMatch?.[1]?.trim() || nameMatch?.[1]?.trim() || "",
    positions,
    overall: ovrMatch ? parseInt(ovrMatch[1]) : 0,
    potential: potMatch ? parseInt(potMatch[1]) : 0,
    age: ageMatch ? parseInt(ageMatch[1]) : 0,
    height: heightMatch ? `${heightMatch[1]}'${heightMatch[2]}"` : "",
    weight: weightMatch ? `${weightMatch[1]} lbs` : "",
    foot: footMatch?.[1]?.trim() || "",
    weakFoot: weakFootMatch ? parseInt(weakFootMatch[1]) : 0,
    skillMoves: skillMovesMatch ? parseInt(skillMovesMatch[1]) : 0,
    workrateAtt: workrateAttMatch?.[1]?.trim() || "",
    workrateDef: workrateDefMatch?.[1]?.trim() || "",
    club: clubMatch?.[2]?.trim() || "",
    clubId: clubMatch ? parseInt(clubMatch[1]) : 0,
    nationality: nationMatch?.[2]?.trim() || "",
    nationalityId: nationMatch ? parseInt(nationMatch[1]) : 0,
    value: valueMatch?.[1]?.trim() || "",
    wage: wageMatch?.[1]?.trim() || "",
    releaseClause: clauseMatch?.[1]?.trim() || "",
    stats: parseStats(html),
    playStyles,
    headshotUrl: headshotMatch?.[1] || "",
    nationUrl: nationImgMatch?.[1] || "",
    teamUrl: teamImgMatch?.[1] || "",
    playerUrl: "",
  };
}

export async function getSofifaPlayer(
  playerId: number
): Promise<SofifaPlayer | null> {
  const cacheKey = `sofifa:player:${playerId}`;
  const cached = getCache<SofifaPlayer>(cacheKey, 24 * 60 * 60 * 1000);
  if (cached) return cached;

  try {
    const url = `${SOFIFA_BASE}/player/${playerId}`;
    const res = await fetch(url, { headers: HEADERS });

    if (!res.ok) {
      console.error(`SOFIFA returned ${res.status} for player ${playerId}`);
      return null;
    }

    const html = await res.text();
    const player = parseSofifaPage(html);

    if (player) {
      player.playerUrl = url;
      setCache(cacheKey, player);
    }

    return player;
  } catch (err) {
    console.error(`SOFIFA fetch failed for ${playerId}:`, err);
    return null;
  }
}

export async function searchSofifaPlayers(
  query: string
): Promise<SofifaPlayer[]> {
  const cacheKey = `sofifa:search:${query}`;
  const cached = getCache<SofifaPlayer[]>(cacheKey, 1 * 60 * 60 * 1000);
  if (cached) return cached;

  try {
    const url = `${SOFIFA_BASE}/players?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: HEADERS });

    if (!res.ok) return [];

    const html = await res.text();
    const players: SofifaPlayer[] = [];

    const rowRegex =
      /<tr[^>]*>.*?<a[^>]*href="\/player\/(\d+)\/([^"]*)"[^>]*>.*?<\/tr>/gis;
    let match;
    while ((match = rowRegex.exec(html))) {
      const playerId = parseInt(match[1]);
      const player = await getSofifaPlayer(playerId);
      if (player) players.push(player);
      if (players.length >= 10) break;
    }

    setCache(cacheKey, players);
    return players;
  } catch (err) {
    console.error("SOFIFA search failed:", err);
    return [];
  }
}

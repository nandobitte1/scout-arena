import { SofifaPlayer } from "@/types";
import { getCache, setCache } from "../cache";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const playersDb = require("./players.json");

const players: SofifaPlayer[] = playersDb as SofifaPlayer[];

function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function getSofifaPlayer(
  playerId: number
): Promise<SofifaPlayer | null> {
  const cacheKey = `sofifa:player:${playerId}`;
  const cached = getCache<SofifaPlayer>(cacheKey, 24 * 60 * 60 * 1000);
  if (cached) return cached;

  const player = players.find((p) => p.id === playerId);
  if (player) {
    setCache(cacheKey, player);
    return player;
  }

  return null;
}

export async function searchSofifaPlayers(
  query: string
): Promise<SofifaPlayer[]> {
  const cacheKey = `sofifa:search:${query}`;
  const cached = getCache<SofifaPlayer[]>(cacheKey, 1 * 60 * 60 * 1000);
  if (cached) return cached;

  const q = normalize(query);
  const results = players
    .filter((p) => {
      const nameMatch = normalize(p.name).includes(q);
      const fullMatch = normalize(p.fullName).includes(q);
      const clubMatch = normalize(p.club).includes(q);
      const natMatch = normalize(p.nationality).includes(q);
      return nameMatch || fullMatch || clubMatch || natMatch;
    })
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 20);

  setCache(cacheKey, results);
  return results;
}

export async function searchByFilters(filters: {
  position?: string;
  minAge?: number;
  maxAge?: number;
  minOverall?: number;
  maxOverall?: number;
  nationality?: string;
}): Promise<SofifaPlayer[]> {
  const cacheKey = `sofifa:filters:${JSON.stringify(filters)}`;
  const cached = getCache<SofifaPlayer[]>(cacheKey, 30 * 60 * 1000);
  if (cached) return cached;

  const results = players.filter((p) => {
    if (
      filters.position &&
      !p.positions.some((pos) =>
        pos.toUpperCase().includes(filters.position!.toUpperCase())
      )
    )
      return false;
    if (filters.minAge && p.age < filters.minAge) return false;
    if (filters.maxAge && p.age > filters.maxAge) return false;
    if (filters.minOverall && p.overall < filters.minOverall) return false;
    if (filters.maxOverall && p.overall > filters.maxOverall) return false;
    if (
      filters.nationality &&
      !normalize(p.nationality).includes(normalize(filters.nationality))
    )
      return false;
    return true;
  });

  setCache(cacheKey, results);
  return results;
}

export function getTotalPlayers(): number {
  return players.length;
}

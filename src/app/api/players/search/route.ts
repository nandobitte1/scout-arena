import { NextRequest, NextResponse } from "next/server";
import { searchSofifaPlayers, searchByFilters, getSofifaPlayer } from "@/lib/sofifa/api";
import { searchPlayers, getPlayerDetail } from "@/lib/arena-virtual/scraper";
import { PlayerResult } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const position = searchParams.get("position") || "";
  const status = searchParams.get("status") || "all";
  const minAge = parseInt(searchParams.get("minAge") || "0");
  const maxAge = parseInt(searchParams.get("maxAge") || "99");
  const minOvr = parseInt(searchParams.get("minOvr") || "0");
  const maxOvr = parseInt(searchParams.get("maxOvr") || "99");
  const nationality = searchParams.get("nationality") || "";

  if (!query && !position && minOvr === 0 && maxOvr < 99) {
    return NextResponse.json(
      { error: "Provide at least one search parameter" },
      { status: 400 }
    );
  }

  try {
    const results: PlayerResult[] = [];

    if (query) {
      // Search Arena API (primary source - real league data)
      const arenaResults = await searchPlayers(query);

      // Also search local SOFIFA DB
      const sofifaResults = await searchSofifaPlayers(query);

      // Merge: Arena results first, then SOFIFA results not already included
      const seenIds = new Set<number>();

      for (const arena of arenaResults) {
        seenIds.add(arena.id);
        const sofifa = await getSofifaPlayer(arena.id).catch(() => null);
        results.push({ arena, sofifa });
      }

      for (const sofifa of sofifaResults) {
        if (!seenIds.has(sofifa.id)) {
          seenIds.add(sofifa.id);
          let arena = null;
          try {
            arena = await getPlayerDetail(sofifa.id);
          } catch {}
          results.push({ arena, sofifa });
        }
      }
    } else {
      // Filter-only search (uses local SOFIFA DB)
      let sofifaResults = await searchByFilters({
        position: position || undefined,
        minAge: minAge || undefined,
        maxAge: maxAge < 99 ? maxAge : undefined,
        minOverall: minOvr || undefined,
        maxOverall: maxOvr < 99 ? maxOvr : undefined,
        nationality: nationality || undefined,
      });

      if (position) {
        sofifaResults = sofifaResults.filter((p) =>
          p.positions.some((pos) =>
            pos.toUpperCase().includes(position.toUpperCase())
          )
        );
      }

      for (const sofifa of sofifaResults) {
        let arena = null;
        try {
          arena = await getPlayerDetail(sofifa.id);
        } catch {}
        results.push({ arena, sofifa });
      }
    }

    // Apply post-filters
    let filtered = results;

    if (position && query) {
      filtered = filtered.filter((r) => {
        const pos = r.arena?.position || r.sofifa?.positions?.[0] || "";
        return pos.toUpperCase().includes(position.toUpperCase());
      });
    }

    if (minAge > 0) {
      filtered = filtered.filter(
        (r) => (r.arena?.age || r.sofifa?.age || 0) >= minAge
      );
    }
    if (maxAge < 99) {
      filtered = filtered.filter(
        (r) => (r.arena?.age || r.sofifa?.age || 99) <= maxAge
      );
    }
    if (minOvr > 0) {
      filtered = filtered.filter(
        (r) => (r.sofifa?.overall || r.arena?.sofifaId ? 0 : 0) >= minOvr
      );
    }
    if (maxOvr < 99) {
      filtered = filtered.filter(
        (r) => (r.sofifa?.overall || 99) <= maxOvr
      );
    }
    if (nationality) {
      filtered = filtered.filter((r) => {
        const nat = r.arena?.nationality || r.sofifa?.nationality || "";
        return nat.toLowerCase().includes(nationality.toLowerCase());
      });
    }
    if (status && status !== "all") {
      filtered = filtered.filter((r) => r.arena?.status === status);
    }

    return NextResponse.json({ results: filtered });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

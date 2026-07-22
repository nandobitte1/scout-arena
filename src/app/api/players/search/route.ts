import { NextRequest, NextResponse } from "next/server";
import { searchSofifaPlayers, searchByFilters } from "@/lib/sofifa/api";
import { getPlayerDetail } from "@/lib/arena-virtual/scraper";
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
    let sofifaResults;

    if (query) {
      sofifaResults = await searchSofifaPlayers(query);
    } else {
      sofifaResults = await searchByFilters({
        position: position || undefined,
        minAge: minAge || undefined,
        maxAge: maxAge < 99 ? maxAge : undefined,
        minOverall: minOvr || undefined,
        maxOverall: maxOvr < 99 ? maxOvr : undefined,
        nationality: nationality || undefined,
      });
    }

    if (position && query) {
      sofifaResults = sofifaResults.filter((p) =>
        p.positions.some((pos) =>
          pos.toUpperCase().includes(position.toUpperCase())
        )
      );
    }

    if (minAge > 0 && query) {
      sofifaResults = sofifaResults.filter((p) => p.age >= minAge);
    }
    if (maxAge < 99 && query) {
      sofifaResults = sofifaResults.filter((p) => p.age <= maxAge);
    }
    if (minOvr > 0 && query) {
      sofifaResults = sofifaResults.filter((p) => p.overall >= minOvr);
    }
    if (maxOvr < 99 && query) {
      sofifaResults = sofifaResults.filter((p) => p.overall <= maxOvr);
    }
    if (nationality && query) {
      sofifaResults = sofifaResults.filter((p) =>
        p.nationality.toLowerCase().includes(nationality.toLowerCase())
      );
    }

    const results: PlayerResult[] = await Promise.all(
      sofifaResults.map(async (sofifa) => {
        let arena = null;
        try {
          arena = await getPlayerDetail(sofifa.id);
        } catch {}
        return { arena, sofifa };
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

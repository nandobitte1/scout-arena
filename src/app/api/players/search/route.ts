import { NextRequest, NextResponse } from "next/server";
import { searchPlayers, getPlayerDetail } from "@/lib/arena-virtual/scraper";
import { searchSofifaPlayers, getSofifaPlayer } from "@/lib/sofifa/api";
import { SearchFilters, PlayerResult } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const position = searchParams.get("position") || "";
  const status = searchParams.get("status") || "all";
  const minValue = parseInt(searchParams.get("minValue") || "0");
  const maxValue = parseInt(searchParams.get("maxValue") || "999999");
  const minAge = parseInt(searchParams.get("minAge") || "0");
  const maxAge = parseInt(searchParams.get("maxAge") || "99");
  const minOvr = parseInt(searchParams.get("minOvr") || "0");
  const maxOvr = parseInt(searchParams.get("maxOvr") || "99");
  const nationality = searchParams.get("nationality") || "";

  if (!query && !position && status === "all") {
    return NextResponse.json(
      { error: "Provide at least one search parameter" },
      { status: 400 }
    );
  }

  try {
    let arenaResults = query
      ? await searchPlayers(query)
      : [];

    if (position) {
      arenaResults = arenaResults.filter((p) =>
        p.position.toUpperCase().includes(position.toUpperCase())
      );
    }

    if (status !== "all") {
      arenaResults = arenaResults.filter((p) => p.status === status);
    }

    if (minValue > 0) {
      arenaResults = arenaResults.filter((p) => p.value >= minValue);
    }
    if (maxValue < 999999) {
      arenaResults = arenaResults.filter((p) => p.value <= maxValue);
    }

    if (nationality) {
      arenaResults = arenaResults.filter((p) =>
        p.nationality.toLowerCase().includes(nationality.toLowerCase())
      );
    }

    let sofifaResults = query
      ? await searchSofifaPlayers(query)
      : [];

    if (position) {
      sofifaResults = sofifaResults.filter((p) =>
        p.positions.some((pos) =>
          pos.toUpperCase().includes(position.toUpperCase())
        )
      );
    }

    if (minAge > 0) {
      sofifaResults = sofifaResults.filter((p) => p.age >= minAge);
    }
    if (maxAge < 99) {
      sofifaResults = sofifaResults.filter((p) => p.age <= maxAge);
    }

    if (minOvr > 0) {
      sofifaResults = sofifaResults.filter((p) => p.overall >= minOvr);
    }
    if (maxOvr < 99) {
      sofifaResults = sofifaResults.filter((p) => p.overall <= maxOvr);
    }

    const merged: PlayerResult[] = [];

    const allIds = new Set<number>();
    for (const p of arenaResults) allIds.add(p.sofifaId);
    for (const p of sofifaResults) allIds.add(p.id);

    for (const id of allIds) {
      const arena = arenaResults.find((p) => p.sofifaId === id) || null;
      const sofifa = sofifaResults.find((p) => p.id === id) || null;
      merged.push({ arena, sofifa });
    }

    if (merged.length === 0 && query) {
      const sofifaOnly = sofifaResults.map((p) => ({
        arena: null,
        sofifa: p,
      }));
      return NextResponse.json({ results: sofifaOnly });
    }

    return NextResponse.json({ results: merged });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

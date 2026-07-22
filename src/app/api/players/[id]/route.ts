import { NextRequest, NextResponse } from "next/server";
import { getSofifaPlayer } from "@/lib/sofifa/api";
import { getPlayerDetail, getArenaApiPlayer } from "@/lib/arena-virtual/scraper";
import { PlayerResult } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playerId = parseInt(id);

  if (isNaN(playerId)) {
    return NextResponse.json(
      { error: "Invalid player ID" },
      { status: 400 }
    );
  }

  try {
    const [sofifa, arena, arenaRaw] = await Promise.all([
      getSofifaPlayer(playerId).catch(() => null),
      getPlayerDetail(playerId).catch(() => null),
      getArenaApiPlayer(playerId).catch(() => null),
    ]);

    if (!sofifa && !arena) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const result: PlayerResult = { arena, sofifa, arenaRaw };

    return NextResponse.json(result);
  } catch (err) {
    console.error(`Player detail API error for ${playerId}:`, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

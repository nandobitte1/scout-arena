import { NextRequest, NextResponse } from "next/server";
import { getPlayerDetail } from "@/lib/arena-virtual/scraper";
import { getSofifaPlayer } from "@/lib/sofifa/api";
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
    const [arena, sofifa] = await Promise.all([
      getPlayerDetail(playerId),
      getSofifaPlayer(playerId),
    ]);

    if (!arena && !sofifa) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const result: PlayerResult = { arena, sofifa };

    return NextResponse.json(result);
  } catch (err) {
    console.error(`Player detail API error for ${playerId}:`, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

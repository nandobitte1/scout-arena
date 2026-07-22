import { NextRequest, NextResponse } from "next/server";
import { getSofifaPlayer } from "@/lib/sofifa/api";

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
    const player = await getSofifaPlayer(playerId);

    if (!player) {
      return NextResponse.json(
        { error: "Player not found on SOFIFA" },
        { status: 404 }
      );
    }

    return NextResponse.json(player);
  } catch (err) {
    console.error(`SOFIFA API error for ${playerId}:`, err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

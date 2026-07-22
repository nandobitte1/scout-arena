import { NextResponse } from "next/server";
import { login } from "@/lib/arena-virtual/scraper";

export async function POST() {
  try {
    const success = await login();

    if (success) {
      return NextResponse.json({ success: true, message: "Login successful" });
    }

    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 401 }
    );
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

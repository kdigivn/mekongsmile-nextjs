import { NextRequest, NextResponse } from "next/server";
import { getAllTours } from "@/services/wordpress/tour-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after") ?? undefined;
  const first = Number(searchParams.get("first") ?? 12);

  try {
    const result = await getAllTours(first, after);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch tours", error);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    );
  }
}

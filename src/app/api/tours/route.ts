import { NextRequest, NextResponse } from "next/server";
import {
  getAllTours,
  getToursByDestination,
  getToursByTravelStyle,
  getToursByTourType,
  getToursByCombinedFilters,
} from "@/services/wordpress/tour-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after") ?? undefined;
  const first = Number(searchParams.get("first") ?? 12);
  const destination = searchParams.get("destination") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const style = searchParams.get("style") ?? undefined;

  try {
    const result =
      destination && style
        ? await getToursByCombinedFilters([destination], [style], first, after)
        : destination
          ? await getToursByDestination([destination], first, after)
          : type
            ? await getToursByTourType([type], first, after)
            : style
              ? await getToursByTravelStyle([style], first, after)
              : await getAllTours(first, after);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch tours", error);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 },
    );
  }
}

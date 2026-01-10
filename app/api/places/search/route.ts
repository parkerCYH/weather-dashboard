import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PlaceModel } from "@/generated/prisma/models";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // 先查詢資料庫
    const dbResults = await prisma.place.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 10,
    });

    return NextResponse.json({
      source: "database",
      results: dbResults.map((place: PlaceModel) => ({
        id: place.id.toString(),
        osmType: place.osmType,
        osmId: place.osmId.toString(),
        name: place.name,
        class: place.class,
        type: place.type,
        lat: place.lat,
        lon: place.lon,
        source: place.source,
      })),
    });
  } catch (error) {
    console.error("Error searching places:", error);
    return NextResponse.json(
      { error: "Failed to search places" },
      { status: 500 }
    );
  }
}

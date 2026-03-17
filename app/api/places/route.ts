import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface CreatePlaceBody {
  osmType: string;
  osmId: string;
  name: string;
  class: string;
  type: string;
  lat: number;
  lon: number;
  source: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePlaceBody = await request.json();
    const { osmType, osmId, name, class: placeClass, type, lat, lon, source } = body;

    // 驗證必要欄位
    if (!osmType || !osmId || !name || !placeClass || !type || !lat || !lon || !source) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 檢查是否已存在
    const existing = await prisma.place.findUnique({
      where: {
        unique_osm: {
          osmType,
          osmId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Place already exists",
        place: {
          id: existing.id.toString(),
          osmType: existing.osmType,
          osmId: existing.osmId,
          name: existing.name,
          class: existing.class,
          type: existing.type,
          lat: existing.lat,
          lon: existing.lon,
          source: existing.source,
        },
      });
    }

    // 創建新地點
    const place = await prisma.place.create({
      data: {
        osmType,
        osmId,
        name,
        class: placeClass,
        type,
        lat: typeof lat === 'string' ? parseFloat(lat) : lat,
        lon: typeof lon === 'string' ? parseFloat(lon) : lon,
        source,
      },
    });

    return NextResponse.json({
      message: "Place created successfully",
      place: {
        id: place.id.toString(),
        osmType: place.osmType,
        osmId: place.osmId,
        name: place.name,
        class: place.class,
        type: place.type,
        lat: place.lat,
        lon: place.lon,
        source: place.source,
      },
    });
  } catch (error) {
    console.error("Error creating place:", error);
    return NextResponse.json(
      { error: "Failed to create place" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

interface NominatimResult {
  osm_type: string;
  osm_id: number;
  display_name: string;
  class: string;
  type: string;
  lat: string;
  lon: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: "Query parameter 'q' is too short or missing" },
        { status: 400 }
      );
    }


    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;

    const response = await fetch(nominatimUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Weather Dashboard/1.0 (fbi0258zzz@gmail.com)",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Nominatim API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data: NominatimResult[] = await response.json();

    const results = data.map((item) => ({
      osmType: item.osm_type,
      osmId: item.osm_id.toString(),
      name: item.display_name,
      class: item.class,
      type: item.type,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      source: "Nominatim",
    }));

    return NextResponse.json({
      source: "nominatim",
      results,
    });

  } catch (error: any) {
    console.error("Nominatim API Error:", error);

    if (error.name === 'TimeoutError') {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
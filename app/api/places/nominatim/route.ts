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
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // 使用 CORS 代理访问 Nominatim API
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=5`;

    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(nominatimUrl)}`;

    console.log("Fetching from Nominatim via proxy:", proxyUrl);

    // 使用 fetch API
    const response = await fetch(proxyUrl, {
      method: "GET",
      headers: {
        "User-Agent": "WeatherDashboard/1.0",
        "Accept": "application/json",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error(`Proxy returned status ${response.status}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response:", text.substring(0, 500));
      throw new Error("Invalid content type: " + contentType);
    }

    const data: NominatimResult[] = await response.json();
    console.log("Nominatim results count:", data.length);

    // 轉換為統一格式
    const results = data.map((item: NominatimResult) => ({
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
  } catch (error) {
    console.error("Error fetching from Nominatim:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: "Failed to fetch from Nominatim", details: errorMessage },
      { status: 500 }
    );
  }
}
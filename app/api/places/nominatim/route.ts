import { NextRequest, NextResponse } from "next/server";
import https from "https";
import { URL } from "url";

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

    // 呼叫 Nominatim API
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=5`;

    console.log("Fetching from Nominatim:", nominatimUrl);

    // 使用 Node.js 原生 https 模組
    const response = await new Promise<NominatimResult[]>((resolve, reject) => {
      const url = new URL(nominatimUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
          "Host": url.hostname,  // 確保 Host header 正確
        },
        // 強制使用 IPv4，避免 IPv6 連線問題
        family: 4,
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (error) {
            reject(new Error("Failed to parse response"));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.setTimeout(30000);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      req.end();
    });

    console.log("Nominatim results count:", response.length);

    // 轉換為統一格式
    const results = response.map((item: NominatimResult) => ({
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

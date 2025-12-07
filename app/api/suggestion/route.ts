import { env } from "@/env";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: env.PARKER_GCP_TEST_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const weatherData = await request.json();

    const prompt = `Based on the following weather data, provide a helpful and concise suggestion or warning for the user in one sentence:

Current Weather:
- Temperature: ${weatherData.current_weather.temperature}°C
- Weather Code: ${weatherData.current_weather.weathercode}
- Wind Speed: ${weatherData.current_weather.windspeed} m/s
- Wind Direction: ${weatherData.current_weather.winddirection}°

Today's Forecast:
- Max Temperature: ${weatherData.daily.temperature_2m_max[0]}°C
- Min Temperature: ${weatherData.daily.temperature_2m_min[0]}°C
- UV Index: ${weatherData.daily.uv_index_max[0]}
- Weather Code: ${weatherData.daily.weathercode[0]}

Hourly Data (next 24 hours):
- Average Humidity: ${
      weatherData.hourly.relativehumidity_2m
        .slice(0, 24)
        .reduce((a: number, b: number) => a + b, 0) / 24
    }%
- Total Precipitation: ${weatherData.hourly.precipitation
      .slice(0, 24)
      .reduce((a: number, b: number) => a + b, 0)} mm
- Precipitation Probability: ${
      weatherData.hourly.precipitation_probability
        .slice(0, 24)
        .reduce((a: number, b: number) => a + b, 0) / 24
    }%

Please provide a practical suggestion about what the user should prepare or be aware of today. Keep it friendly and under 20 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const suggestion = response.text;

    return NextResponse.json({
      suggestion,
      warning: shouldShowWarning(weatherData),
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      {
        suggestion: "Unable to generate weather suggestion at this time.",
        warning: false,
      },
      { status: 500 }
    );
  }
}

function shouldShowWarning(weatherData: any): boolean {
  // Determine if we should show a warning based on weather conditions
  const uvIndex = weatherData.daily.uv_index_max[0];
  const windSpeed = weatherData.current_weather.windspeed;
  const precipitation = weatherData.hourly.precipitation
    .slice(0, 24)
    .reduce((a: number, b: number) => a + b, 0);

  return uvIndex > 7 || windSpeed > 20 || precipitation > 10;
}

import { env } from "@/env";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { weatherDataSchema } from "@/lib/schemas/weather";
import { generateWeatherSuggestionPrompt, shouldShowWarning } from "@/lib/suggestion";

const ai = new GoogleGenAI({ apiKey: env.PARKER_GCP_TEST_API_KEY });

export async function POST(request: NextRequest) {
  try {

    const rawWeatherData = await request.json();
    

    const validationResult = weatherDataSchema.safeParse(rawWeatherData);
    
    if (!validationResult.success) {
      console.error("[SUGGESTION] Weather data validation failed:", validationResult.error);
      return NextResponse.json(
        {
          suggestion: "Invalid weather data provided.",
          warning: false,
        },
        { status: 400 }
      );
    }
    
    const weatherData = validationResult.data;


    const cacheKey = `suggestion:${weatherData.latitude}:${weatherData.longitude}:${weatherData.current_weather.time}`;

 
    const cachedSuggestion = await redis.get(cacheKey);
    
    if (cachedSuggestion) {

      return NextResponse.json(cachedSuggestion);
    }
    
    const prompt = generateWeatherSuggestionPrompt(weatherData);


    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const suggestion = response.text;


    const result = {
      suggestion,
      warning: shouldShowWarning(weatherData),
    };



    await redis.set(cacheKey, result, { ex: 3600 });



    await redis.incr("suggestion:api:requests");

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SUGGESTION] Error calling Gemini API:", error);
    return NextResponse.json(
      {
        suggestion: "Unable to generate weather suggestion at this time.",
        warning: false,
      },
      { status: 500 }
    );
  }
}

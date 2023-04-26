import openai from "@/openai";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // weather data

  const { weatherData } = await request.json();

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      n: 1,
      stream: false,
      messages: [
        {
          role: "system",
          content: "pretend you're a weather news presenter",
        },
        {
          role: "user",
          content: `hi there, can I get a summary of todays weather, use the following information to get the weather data: 
          ${JSON.stringify(weatherData)}`,
        },
      ],
    });

    const { data } = response;

    return NextResponse.json(data.choices[0].message);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    return NextResponse.json([]);
  }
}

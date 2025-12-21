import { WeatherData } from "./schemas/weather";
 
export function generateWeatherSuggestionPrompt(
  weatherData: WeatherData
): string {
  const avgHumidity =
    weatherData.hourly.relativehumidity_2m
      .slice(0, 24)
      .reduce((a, b) => a + b, 0) / 24;

  const totalPrecipitation = weatherData.hourly.precipitation
    .slice(0, 24)
    .reduce((a, b) => a + b, 0);

  const avgPrecipitationProbability =
    weatherData.hourly.precipitation_probability
      .slice(0, 24)
      .reduce((a, b) => a + b, 0) / 24;

  return `Based on the following weather data, provide a helpful and concise suggestion or warning for the user in one sentence:

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
- Average Humidity: ${avgHumidity}%
- Total Precipitation: ${totalPrecipitation} mm
- Precipitation Probability: ${avgPrecipitationProbability}%

Please provide a practical suggestion about what the user should prepare or be aware of today. Keep it friendly and under 150 words.`;
} 
export function shouldShowWarning(weatherData: WeatherData): boolean {
  const uvIndex = weatherData.daily.uv_index_max[0];
  const windSpeed = weatherData.current_weather.windspeed;
  const precipitation = weatherData.hourly.precipitation
    .slice(0, 24)
    .reduce((a, b) => a + b, 0);

  return uvIndex > 7 || windSpeed > 20 || precipitation > 10;
}

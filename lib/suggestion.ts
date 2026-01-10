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

  return `根據以下天氣資料，請用繁體中文提供實用且簡潔的建議或警告：

目前天氣：
- 溫度：${weatherData.current_weather.temperature}°C
- 天氣代碼：${weatherData.current_weather.weathercode}
- 風速：${weatherData.current_weather.windspeed} m/s
- 風向：${weatherData.current_weather.winddirection}°

今日預報：
- 最高溫度：${weatherData.daily.temperature_2m_max[0]}°C
- 最低溫度：${weatherData.daily.temperature_2m_min[0]}°C
- 紫外線指數：${weatherData.daily.uv_index_max[0]}
- 天氣代碼：${weatherData.daily.weathercode[0]}

未來 24 小時數據：
- 平均濕度：${avgHumidity}%
- 總降雨量：${totalPrecipitation} mm
- 降雨機率：${avgPrecipitationProbability}%

請用繁體中文提供實用的建議，告訴使用者今天應該準備或注意什麼。保持友善且字數在 150 字以內。`;
}
export function shouldShowWarning(weatherData: WeatherData): boolean {
  const uvIndex = weatherData.daily.uv_index_max[0];
  const windSpeed = weatherData.current_weather.windspeed;
  const precipitation = weatherData.hourly.precipitation
    .slice(0, 24)
    .reduce((a, b) => a + b, 0);

  return uvIndex > 7 || windSpeed > 20 || precipitation > 10;
}

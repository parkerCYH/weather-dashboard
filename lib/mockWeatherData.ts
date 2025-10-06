// Mock data based on the GraphQL schema
export const mockWeatherData = {
  myQuery: {
    longitude: 121.5654,
    latitude: 25.033,
    utc_offset_seconds: 28800,
    elevation: 10,
    timezone: "Asia/Taipei",
    timezone_abbreviation: "CST",
    generationtime_ms: 0.5,
    current_weather: {
      is_day: 1,
      temperature: 28.5,
      time: Math.floor(Date.now() / 1000), // Current Unix timestamp
      winddirection: 180,
      weathercode: 3,
      windspeed: 12.5,
    },
    daily: {
      weathercode: [3, 2, 1, 0, 2, 3, 1] as any,
      temperature_2m_max: [32.5, 31.2, 30.8, 33.1, 31.5, 29.8, 30.5] as any,
      temperature_2m_min: [24.3, 23.8, 24.1, 25.0, 24.5, 23.2, 23.8] as any,
      apparent_temperature_max: [
        34.5, 33.2, 32.8, 35.1, 33.5, 31.8, 32.5,
      ] as any,
      apparent_temperature_min: [
        22.3, 21.8, 22.1, 23.0, 22.5, 21.2, 21.8,
      ] as any,
      time: [
        1728172800, 1728259200, 1728345600, 1728432000, 1728518400, 1728604800,
        1728691200,
      ] as any,
      sunrise: [
        1728172800, // Example Unix timestamps
        1728259200,
        1728345600,
        1728432000,
        1728518400,
        1728604800,
        1728691200,
      ] as any,
      sunset: [
        1728216000, 1728302400, 1728388800, 1728475200, 1728561600, 1728648000,
        1728734400,
      ] as any,
      uv_index_max: [7.5, 6.8, 8.2, 7.0, 6.5, 5.8, 7.2] as any,
      uv_index_clear_sky_max: [8.5, 7.8, 9.2, 8.0, 7.5, 6.8, 8.2] as any,
    },
    daily_units: {
      temperature_2m_max: "°C",
      temperature_2m_min: "°C",
      apparent_temperature_max: "°C",
      apparent_temperature_min: "°C",
      time: "unixtime",
      weathercode: "wmo code",
      sunrise: "unixtime",
      sunset: "unixtime",
      uv_index_max: "",
      uv_index_clear_sky_max: "",
    },
    hourly: {
      apparent_temperature: Array.from(
        { length: 168 },
        (_, i) => 25 + Math.sin(i / 4) * 5
      ) as any,
      dewpoint_2m: Array.from(
        { length: 168 },
        (_, i) => 18 + Math.sin(i / 6) * 3
      ) as any,
      is_day: Array.from({ length: 168 }, (_, i) => {
        const hour = i % 24;
        return hour >= 6 && hour <= 18 ? 1 : 0;
      }) as any,
      precipitation: Array.from({ length: 168 }, (_, i) =>
        Math.max(0, Math.sin(i / 8) * 2)
      ) as any,
      precipitation_probability: Array.from({ length: 168 }, (_, i) =>
        Math.max(0, Math.min(100, 30 + Math.sin(i / 12) * 40))
      ) as any,
      relativehumidity_2m: Array.from(
        { length: 168 },
        (_, i) => 65 + Math.sin(i / 10) * 15
      ) as any,
      temperature_2m: Array.from(
        { length: 168 },
        (_, i) => 26 + Math.sin(i / 4) * 6
      ) as any,
      time: Array.from(
        { length: 168 },
        (_, i) => Math.floor(Date.now() / 1000) + i * 3600
      ) as any,
      rain: Array.from({ length: 168 }, (_, i) =>
        Math.max(0, Math.sin(i / 8) * 1.5)
      ) as any,
      showers: Array.from({ length: 168 }, (_, i) =>
        Math.max(0, Math.sin(i / 10) * 1)
      ) as any,
      snow_depth: Array.from({ length: 168 }, () => 0) as any,
      snowfall: Array.from({ length: 168 }, () => 0) as any,
      uv_index: Array.from({ length: 168 }, (_, i) => {
        const hour = i % 24;
        if (hour >= 6 && hour <= 18) {
          return Math.max(0, 5 + Math.sin(((hour - 12) / 6) * Math.PI) * 3);
        }
        return 0;
      }) as any,
      uv_index_clear_sky: Array.from({ length: 168 }, (_, i) => {
        const hour = i % 24;
        if (hour >= 6 && hour <= 18) {
          return Math.max(0, 6 + Math.sin(((hour - 12) / 6) * Math.PI) * 4);
        }
        return 0;
      }) as any,
    },
    hourly_units: {
      apparent_temperature: "°C",
      dewpoint_2m: "°C",
      is_day: "",
      precipitation: "mm",
      precipitation_probability: "%",
      rain: "mm",
      relativehumidity_2m: "%",
      showers: "mm",
      snow_depth: "cm",
      snowfall: "cm",
      temperature_2m: "°C",
      time: "unixtime",
      uv_index: "",
      uv_index_clear_sky: "",
    },
  },
};

// Function to generate dynamic mock data based on lat/long
export const getMockWeatherData = (
  lat: string,
  long: string
): typeof mockWeatherData.myQuery => {
  const baseData = { ...mockWeatherData.myQuery };

  // Adjust temperature based on latitude (higher latitude = cooler)
  const latNum = parseFloat(lat);
  const tempAdjustment = (Math.abs(latNum) - 25) * -0.5;

  return {
    ...baseData,
    latitude: parseFloat(lat),
    longitude: parseFloat(long),
    current_weather: {
      ...baseData.current_weather,
      temperature: baseData.current_weather.temperature + tempAdjustment,
    },
    daily: {
      ...baseData.daily,
      temperature_2m_max: baseData.daily.temperature_2m_max.map(
        (temp: any) => temp + tempAdjustment
      ) as any,
      temperature_2m_min: baseData.daily.temperature_2m_min.map(
        (temp: any) => temp + tempAdjustment
      ) as any,
      apparent_temperature_max: baseData.daily.apparent_temperature_max.map(
        (temp: any) => temp + tempAdjustment
      ) as any,
      apparent_temperature_min: baseData.daily.apparent_temperature_min.map(
        (temp: any) => temp + tempAdjustment
      ) as any,
    },
    hourly: {
      ...baseData.hourly,
      temperature_2m: baseData.hourly.temperature_2m.map(
        (temp: any) => temp + tempAdjustment
      ) as any,
      apparent_temperature: baseData.hourly.apparent_temperature.map(
        (temp: any) => temp + tempAdjustment
      ) as any,
    },
  };
};

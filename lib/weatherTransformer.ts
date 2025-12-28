
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  generationtime_ms: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  current_units: {
    time: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    is_day: string;
    precipitation: string;
    rain: string;
    showers: string;
    snowfall: string;
    weather_code: string;
    cloud_cover: string;
    pressure_msl: string;
    surface_pressure: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    wind_gusts_10m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    dewpoint_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain: number[];
    showers: number[];
    snowfall: number[];
    snow_depth: number[];
    weather_code: number[];
    pressure_msl: number[];
    surface_pressure: number[];
    cloud_cover: number[];
    visibility: number[];
    evapotranspiration: number[];
    et0_fao_evapotranspiration: number[];
    vapour_pressure_deficit: number[];
    wind_speed_10m: number[];
    wind_speed_80m: number[];
    wind_speed_120m: number[];
    wind_speed_180m: number[];
    wind_direction_10m: number[];
    wind_direction_80m: number[];
    wind_direction_120m: number[];
    wind_direction_180m: number[];
    wind_gusts_10m: number[];
    temperature_80m: number[];
    temperature_120m: number[];
    temperature_180m: number[];
    soil_temperature_0cm: number[];
    soil_temperature_6cm: number[];
    soil_temperature_18cm: number[];
    soil_temperature_54cm: number[];
    soil_moisture_0_to_1cm: number[];
    soil_moisture_1_to_3cm: number[];
    soil_moisture_3_to_9cm: number[];
    soil_moisture_9_to_27cm: number[];
    soil_moisture_27_to_81cm: number[];
    is_day: number[];
    uv_index: number[];
    uv_index_clear_sky: number[];
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    dewpoint_2m: string;
    apparent_temperature: string;
    precipitation_probability: string;
    precipitation: string;
    rain: string;
    showers: string;
    snowfall: string;
    snow_depth: string;
    weather_code: string;
    pressure_msl: string;
    surface_pressure: string;
    cloud_cover: string;
    visibility: string;
    evapotranspiration: string;
    et0_fao_evapotranspiration: string;
    vapour_pressure_deficit: string;
    wind_speed_10m: string;
    wind_speed_80m: string;
    wind_speed_120m: string;
    wind_speed_180m: string;
    wind_direction_10m: string;
    wind_direction_80m: string;
    wind_direction_120m: string;
    wind_direction_180m: string;
    wind_gusts_10m: string;
    temperature_80m: string;
    temperature_120m: string;
    temperature_180m: string;
    soil_temperature_0cm: string;
    soil_temperature_6cm: string;
    soil_temperature_18cm: string;
    soil_temperature_54cm: string;
    soil_moisture_0_to_1cm: string;
    soil_moisture_1_to_3cm: string;
    soil_moisture_3_to_9cm: string;
    soil_moisture_9_to_27cm: string;
    soil_moisture_27_to_81cm: string;
    is_day: string;
    uv_index: string;
    uv_index_clear_sky: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    daylight_duration: number[];
    sunshine_duration: number[];
    uv_index_max: number[];
    uv_index_clear_sky_max: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    shortwave_radiation_sum: number[];
    et0_fao_evapotranspiration: number[];
  };
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    apparent_temperature_max: string;
    apparent_temperature_min: string;
    sunrise: string;
    sunset: string;
    daylight_duration: string;
    sunshine_duration: string;
    uv_index_max: string;
    uv_index_clear_sky_max: string;
    precipitation_sum: string;
    rain_sum: string;
    showers_sum: string;
    snowfall_sum: string;
    precipitation_hours: string;
    precipitation_probability_max: string;
    wind_speed_10m_max: string;
    wind_gusts_10m_max: string;
    wind_direction_10m_dominant: string;
    shortwave_radiation_sum: string;
    et0_fao_evapotranspiration: string;
  };
}
 
export function transformWeatherData(data: OpenMeteoResponse): Root {
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    timezone: data.timezone,
    timezone_abbreviation: data.timezone_abbreviation,
    utc_offset_seconds: data.utc_offset_seconds,
    generationtime_ms: data.generationtime_ms,
    current_weather: {
      temperature: data.current.temperature_2m,
      windspeed: data.current.wind_speed_10m,
      winddirection: data.current.wind_direction_10m,
      weathercode: data.current.weather_code,
      is_day: data.current.is_day,
      time: Math.floor(Date.now() / 1000),
    },
    daily: {
      time: data.daily.time.map((t: string) =>
        Math.floor(new Date(t).getTime() / 1000)
      ),
      weathercode: data.daily.weather_code,
      temperature_2m_max: data.daily.temperature_2m_max,
      temperature_2m_min: data.daily.temperature_2m_min,
      apparent_temperature_max: data.daily.apparent_temperature_max,
      apparent_temperature_min: data.daily.apparent_temperature_min,
      sunrise: data.daily.sunrise.map((t: string) =>
        Math.floor(new Date(t).getTime() / 1000)
      ),
      sunset: data.daily.sunset.map((t: string) =>
        Math.floor(new Date(t).getTime() / 1000)
      ),
      uv_index_max: data.daily.uv_index_max,
      uv_index_clear_sky_max: data.daily.uv_index_clear_sky_max,
    },
    daily_units: {
      time: "unixtime",
      weathercode: "wmo code",
      temperature_2m_max: data.daily_units.temperature_2m_max,
      temperature_2m_min: data.daily_units.temperature_2m_min,
      apparent_temperature_max: data.daily_units.apparent_temperature_max,
      apparent_temperature_min: data.daily_units.apparent_temperature_min,
      sunrise: "unixtime",
      sunset: "unixtime",
      uv_index_max: data.daily_units.uv_index_max,
      uv_index_clear_sky_max: data.daily_units.uv_index_clear_sky_max,
    },
    hourly: {
      time: data.hourly.time.map((t: string) =>
        Math.floor(new Date(t).getTime() / 1000)
      ),
      temperature_2m: data.hourly.temperature_2m,
      relativehumidity_2m: data.hourly.relative_humidity_2m,
      dewpoint_2m: data.hourly.dewpoint_2m,
      apparent_temperature: data.hourly.apparent_temperature,
      precipitation_probability: data.hourly.precipitation_probability,
      precipitation: data.hourly.precipitation,
      rain: data.hourly.rain,
      showers: data.hourly.showers,
      snowfall: data.hourly.snowfall,
      snow_depth: data.hourly.snow_depth,
      is_day: data.hourly.is_day,
      uv_index: data.hourly.uv_index,
      uv_index_clear_sky: data.hourly.uv_index_clear_sky,
    },
    hourly_units: {
      time: "unixtime",
      temperature_2m: data.hourly_units.temperature_2m,
      relativehumidity_2m: data.hourly_units.relative_humidity_2m,
      dewpoint_2m: data.hourly_units.dewpoint_2m,
      apparent_temperature: data.hourly_units.apparent_temperature,
      precipitation_probability: data.hourly_units.precipitation_probability,
      precipitation: data.hourly_units.precipitation,
      rain: data.hourly_units.rain,
      showers: data.hourly_units.showers,
      snowfall: data.hourly_units.snowfall,
      snow_depth: data.hourly_units.snow_depth,
      is_day: "",
      uv_index: data.hourly_units.uv_index,
      uv_index_clear_sky: data.hourly_units.uv_index_clear_sky,
    },
  };
}

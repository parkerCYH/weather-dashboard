import { gql } from "@apollo/client";

// const fetchWeatherQuery = gql`
//   query MyQuery(
//     $current_weather: String
//     $daily: String = "weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,uv_index_clear_sky_max"
//     $hourly: String = "temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,windgusts_10m,uv_index,uv_index_clear_sky"
//     $latitude: String!
//     $longitude: String!
//     $timezone: String!
//   ) {
//     myQuery(
//       current_weather: $current_weather
//       hourly: $hourly
//       longitude: $longitude
//       daily: $daily
//       latitude: $latitude
//       timezone: $timezone
//     ) {
//       longitude
//       latitude
//       utc_offset_seconds
//       elevation
//       timezone
//       timezone_abbreviation
//       generationtime_ms
//       current_weather {
//         is_day
//         temperature
//         time
//         winddirection
//         weathercode
//         windspeed
//       }
//       daily {
//         apparent_temperature_max
//         apparent_temperature_min
//         sunrise
//         temperature_2m_max
//         temperature_2m_min
//         sunset
//         time
//         weathercode
//       }
//       daily_units {
//         apparent_temperature_max
//         apparent_temperature_min
//         sunrise
//         sunset
//         temperature_2m_max
//         temperature_2m_min
//         time
//         weathercode
//       }
//       hourly {
//         apparent_temperature
//         dewpoint_2m
//         precipitation
//         precipitation_probability
//         relativehumidity_2m
//         temperature_2m
//         time
//         uv_index
//         uv_index_clear_sky
//       }
//       hourly_units {
//         apparent_temperature
//         dewpoint_2m
//         precipitation
//         precipitation_probability
//         relativehumidity_2m
//         temperature_2m
//         time
//         uv_index
//         uv_index_clear_sky
//       }
//     }
//   }
// `;

const fetchWeatherQuery = gql`
  query MyQuery(
    $current_weather: String
    $daily: String = "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,uv_index_clear_sky_max"
    $hourly: String = "temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,windgusts_10m,uv_index,uv_index_clear_sky"
    $latitude: String!
    $longitude: String!
    $timezone: String = "auto"
    $timeformat: String = "unixtime"
  ) {
    myQuery(
      current_weather: $current_weather
      hourly: $hourly
      longitude: $longitude
      daily: $daily
      latitude: $latitude
      timezone: $timezone
      timeformat: $timeformat
    ) {
      longitude
      latitude
      utc_offset_seconds
      elevation
      timezone
      timezone_abbreviation
      generationtime_ms
      current_weather {
        is_day
        temperature
        time
        winddirection
        weathercode
        windspeed
      }
      daily {
        weathercode
        temperature_2m_max
        temperature_2m_min
        sunrise
        sunset
        uv_index_max
        uv_index_clear_sky_max
      }
      daily_units {
        temperature_2m_max
        temperature_2m_min
        time
        weathercode
        sunrise
        sunset
        uv_index_max
      }
      hourly {
        apparent_temperature
        dewpoint_2m
        precipitation
        precipitation_probability
        relativehumidity_2m
        temperature_2m
        time
        uv_index
        uv_index_clear_sky
      }
      hourly_units {
        apparent_temperature
        dewpoint_2m
        precipitation
        precipitation_probability
        relativehumidity_2m
        temperature_2m
        time
        uv_index
        uv_index_clear_sky
      }
    }
  }
`;

export default fetchWeatherQuery;

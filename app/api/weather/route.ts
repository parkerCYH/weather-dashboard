import { redis } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';
import { setDefaultResultOrder } from 'dns';
import { transformWeatherData, type OpenMeteoResponse } from '@/lib/weatherTransformer';
import { openMeteoResponseSchema, weatherDataSchema } from '@/lib/schemas/weather';
import https from 'https';

setDefaultResultOrder('ipv4first');

async function fetchWeatherData(url: string): Promise<OpenMeteoResponse> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const options = {
            timeout: 30000,
            family: 4,
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Weather-Dashboard/1.0',
            },
        };

        const req = https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Open-Meteo API error: ${res.statusCode} ${res.statusMessage}`));
                return;
            }

            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);

                    resolve(parsed);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            const endTime = Date.now();
            console.error(`[FETCH] Request failed after ${endTime - startTime}ms:`, {
                message: error.message,
                code: (error as NodeJS.ErrnoException).code,
            });
            reject(error);
        });

        req.on('timeout', () => {
            console.error('[FETCH] Request timeout (30s)');
            req.destroy();
            reject(new Error('Request timeout after 30 seconds'));
        });
    });
}

async function fetchWithRetry(url: string, retries = 3): Promise<OpenMeteoResponse> {
    console.log(`[RETRY] Starting fetch with retry logic (max ${retries} attempts)`);

    for (let i = 0; i < retries; i++) {
        try {
            const result = await fetchWeatherData(url);

            return result;
        } catch (error) {
            if (i === retries - 1) {
                console.error(`[RETRY] All ${retries} attempts failed`);
                throw error;
            }
            const waitTime = 1000 * (i + 1);
            console.log(`[RETRY] Attempt ${i + 1} failed, waiting ${waitTime}ms before retry`);
            console.error(`[RETRY] Error details:`, error);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    }

    throw new Error('Failed to fetch data after all retry attempts');
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const latitude = searchParams.get('latitude');
        const longitude = searchParams.get('longitude');

        if (!latitude || !longitude) {
            console.error('[API] Missing required parameters');
            return NextResponse.json(
                { error: 'Latitude and longitude are required' },
                { status: 400 },
            );
        }

        const cacheKey = `weather:${latitude}:${longitude}`;

        await redis.incr('weather:api:requests');

        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            return NextResponse.json({
                ...cachedData,
                cached: true,
            });
        }

        // Fetch fresh data from open-meteo.com
        const params = new URLSearchParams({
            latitude,
            longitude,
            current:
                'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
            hourly: 'temperature_2m,relative_humidity_2m,dewpoint_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm,is_day,uv_index,uv_index_clear_sky',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration',
            timezone: 'auto',
        });

        const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?${params}`;

        const rawData = await fetchWithRetry(openMeteoUrl);

        // Validate OpenMeteo API response with Zod
        const validationResult = openMeteoResponseSchema.safeParse(rawData);

        if (!validationResult.success) {
            console.error('[API] OpenMeteo response validation failed:', validationResult.error);
            return NextResponse.json(
                { error: 'Invalid weather data received from OpenMeteo API' },
                { status: 500 },
            );
        }

        const data: OpenMeteoResponse = validationResult.data;

        const transformedData = transformWeatherData(data);

        const transformedValidation = weatherDataSchema.safeParse(transformedData);

        if (!transformedValidation.success) {
            console.error(
                '[API] Transformed weather data validation failed:',
                transformedValidation.error,
            );
            return NextResponse.json(
                { error: 'Invalid transformed weather data' },
                { status: 500 },
            );
        }

        await redis.set(cacheKey, transformedValidation.data, { ex: 3600 });

        return NextResponse.json({
            ...transformedValidation.data,
            cached: false,
        });
    } catch (error) {
        console.error('[API] Weather API Error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined,
            cause: error instanceof Error ? error.cause : undefined,
        });
        return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
    }
}

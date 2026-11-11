import type { DailyForecast, GeoLocation, WeatherResult } from '../types/weather';
import { createWeatherError } from './weatherErrors';
import { FORECAST_DAYS, REQUEST_TIMEOUT_MS } from './weatherConfig';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface FetchLike {
    (
        url: string,
        init: { signal: AbortSignal },
    ): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
}

const defaultFetch: FetchLike = (url, init) => fetch(url, init);

export function buildWeatherUrl(location: GeoLocation, days = FORECAST_DAYS): string {
    const params: Record<string, string> = {
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current:
            'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',
        daily:
            'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: String(days),
    };
    // ประกอบเองแทน URLSearchParams เพราะของ React Native ไม่ครบทุกเวอร์ชัน
    const query = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
    return `${BASE_URL}?${query}`;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const num = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

/** ตรวจรูปแบบข้อมูลจาก API แล้วแปลงเป็นโมเดลของแอป ถ้าผิดรูปแบบจะโยน error ชนิด invalid */
export function parseWeather(json: unknown, location: GeoLocation): WeatherResult {
    const root = asRecord(json);
    const current = asRecord(root?.current);
    const daily = asRecord(root?.daily);
    if (!current || !daily) {
        throw createWeatherError('invalid');
    }

    const temperature = num(current.temperature_2m);
    const weatherCode = num(current.weather_code);
    if (temperature === null || weatherCode === null) {
        throw createWeatherError('invalid');
    }

    const column = (key: string): unknown[] =>
        Array.isArray(daily[key]) ? (daily[key] as unknown[]) : [];
    const times = column('time');
    const codes = column('weather_code');
    const maxs = column('temperature_2m_max');
    const mins = column('temperature_2m_min');
    const rain = column('precipitation_sum');
    const probability = column('precipitation_probability_max');

    const days: DailyForecast[] = [];
    times.forEach((date, i) => {
        const tempMax = num(maxs[i]);
        const tempMin = num(mins[i]);
        const code = num(codes[i]);
        if (typeof date !== 'string' || tempMax === null || tempMin === null || code === null) {
            return;
        }
        days.push({
            date,
            weatherCode: code,
            tempMax,
            tempMin,
            precipitationSum: num(rain[i]) ?? 0,
            precipitationProbability: num(probability[i]) ?? 0,
        });
    });
    if (days.length === 0) {
        throw createWeatherError('invalid');
    }

    return {
        location,
        current: {
            temperature,
            apparentTemperature: num(current.apparent_temperature) ?? temperature,
            humidity: num(current.relative_humidity_2m) ?? 0,
            windSpeed: num(current.wind_speed_10m) ?? 0,
            precipitation: num(current.precipitation) ?? 0,
            weatherCode,
            isDay: current.is_day !== 0,
        },
        daily: days,
    };
}

interface FetchOptions {
    signal?: AbortSignal;
    timeoutMs?: number;
    fetchFn?: FetchLike;
}

export async function fetchWeather(
    location: GeoLocation,
    { signal, timeoutMs = REQUEST_TIMEOUT_MS, fetchFn = defaultFetch }: FetchOptions = {},
): Promise<WeatherResult> {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeoutMs);
    const forwardAbort = () => controller.abort();
    signal?.addEventListener('abort', forwardAbort);
    if (signal?.aborted) {
        controller.abort();
    }

    try {
        const response = await fetchFn(buildWeatherUrl(location), { signal: controller.signal });
        if (!response.ok) {
            throw createWeatherError('server', response.status);
        }
        return parseWeather(await response.json(), location);
    } catch (error) {
        if (error instanceof Error && error.name === 'WeatherError') {
            throw error;
        }
        if (timedOut) {
            throw createWeatherError('timeout');
        }
        if (signal?.aborted) {
            throw createWeatherError('aborted');
        }
        if (error instanceof SyntaxError) {
            throw createWeatherError('invalid');
        }
        throw createWeatherError('network');
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', forwardAbort);
    }
}
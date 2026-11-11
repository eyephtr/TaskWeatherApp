import type { GeoLocation, WeatherData } from '../types/weather';
import type { KeyValueStore } from './keyValueStore';

export interface WeatherCache {
    read(location: GeoLocation): Promise<WeatherData | null>;
    write(data: WeatherData): Promise<void>;
}

const keyFor = (l: GeoLocation) => `weather:${l.latitude.toFixed(2)},${l.longitude.toFixed(2)}`;

function isWeatherData(value: unknown): value is WeatherData {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const v = value as Record<string, unknown>;
    return (
        typeof v.fetchedAt === 'number' &&
        typeof v.location === 'object' &&
        v.location !== null &&
        typeof v.current === 'object' &&
        v.current !== null &&
        Array.isArray(v.daily)
    );
}

export function createWeatherCache(kv: KeyValueStore): WeatherCache {
    return {
        async read(location) {
            const raw = await kv.getItem(keyFor(location));
            if (!raw) {
                return null;
            }
            try {
                const parsed: unknown = JSON.parse(raw);
                return isWeatherData(parsed) ? parsed : null;
            } catch {
                return null; // cache เสียหาย: ถือว่าไม่มี แล้วไปเรียก API ใหม่
            }
        },
        write: data => kv.setItem(keyFor(data.location), JSON.stringify(data)),
    };
}
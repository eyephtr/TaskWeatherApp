import type { GeoLocation } from '../types/weather';

export const CACHE_TTL_MS = 10 * 60 * 1000;
export const REQUEST_TIMEOUT_MS = 10000;
export const FORECAST_DAYS = 5;

export const DEFAULT_LOCATION: GeoLocation = {
    name: 'Bangkok',
    latitude: 13.7563,
    longitude: 100.5018,
};
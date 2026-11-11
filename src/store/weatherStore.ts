import { create } from 'zustand';

import type { GeoLocation, WeatherData, WeatherResult } from '../types/weather';
import type { WeatherCache } from '../storage/weatherCache';

import {
    isWeatherError,
    weatherErrorMessage,
    type WeatherErrorKind,
} from '../services/weatherErrors';
import { CACHE_TTL_MS, DEFAULT_LOCATION } from '../services/weatherConfig';

import { isFresh } from '../utils/cache';

export interface WeatherDeps {
    fetchWeather: (location: GeoLocation, signal: AbortSignal) => Promise<WeatherResult>;
    cache: WeatherCache;
    now?: () => number;
    ttlMs?: number;
}

export interface WeatherState {
    location: GeoLocation;
    status: 'idle' | 'loading' | 'success' | 'error';
    data: WeatherData | null;
    isRefreshing: boolean;
    isStale: boolean;
    errorKind: WeatherErrorKind | null;
    errorMessage: string | null;
    load: (options?: { force?: boolean }) => Promise<void>;
    setLocation: (location: GeoLocation) => Promise<void>;
}

export function createWeatherStore(deps: WeatherDeps) {
    const { fetchWeather, cache, now = Date.now, ttlMs = CACHE_TTL_MS } = deps;

    let inFlight: Promise<void> | null = null;
    let controller: AbortController | null = null;
    let requestId = 0;

    return create<WeatherState>()((set, get) => {
        const run = async (force: boolean): Promise<void> => {
            const id = ++requestId;
            const isCurrent = () => id === requestId;
            const location = get().location;

            const cached = await cache.read(location).catch(() => null);
            if (!isCurrent()) {
                return;
            }

            if (cached && !force && isFresh(cached.fetchedAt, now(), ttlMs)) {
                set({
                    data: cached,
                    status: 'success',
                    isRefreshing: false,
                    isStale: false,
                    errorKind: null,
                    errorMessage: null,
                });
                return;
            }

            const fallback = cached ?? get().data;
            set(
                fallback
                    ? {
                        data: fallback,
                        status: 'success',
                        isRefreshing: true,
                        errorKind: null,
                        errorMessage: null,
                    }
                    : { status: 'loading', isRefreshing: false, errorKind: null, errorMessage: null },
            );

            const request = new AbortController();
            controller = request;
            try {
                const result = await fetchWeather(location, request.signal);
                if (!isCurrent()) {
                    return;
                }
                const data: WeatherData = { ...result, fetchedAt: now() };
                set({
                    data,
                    status: 'success',
                    isRefreshing: false,
                    isStale: false,
                    errorKind: null,
                    errorMessage: null,
                });
                await cache.write(data).catch(() => undefined);
            } catch (error) {
                if (!isCurrent()) {
                    return;
                }
                const kind: WeatherErrorKind = isWeatherError(error) ? error.kind : 'unknown';
                const errorMessage = weatherErrorMessage(kind);
                if (fallback) {
                    set({
                        data: fallback,
                        status: 'success',
                        isRefreshing: false,
                        isStale: true,
                        errorKind: kind,
                        errorMessage,
                    });
                } else {
                    set({
                        data: null,
                        status: 'error',
                        isRefreshing: false,
                        isStale: false,
                        errorKind: kind,
                        errorMessage,
                    });
                }
            }
        };

        return {
            location: DEFAULT_LOCATION,
            status: 'idle',
            data: null,
            isRefreshing: false,
            isStale: false,
            errorKind: null,
            errorMessage: null,

            load: ({ force = false } = {}) => {
                if (inFlight) {
                    return inFlight;
                }
                const promise: Promise<void> = run(force).finally(() => {
                    if (inFlight === promise) {
                        inFlight = null;
                    }
                });
                inFlight = promise;
                return promise;
            },

            setLocation: location => {
                controller?.abort();
                requestId++; 
                inFlight = null;
                set({
                    location,
                    data: null,
                    status: 'idle',
                    isRefreshing: false,
                    isStale: false,
                    errorKind: null,
                    errorMessage: null,
                });
                return get().load();
            },
        };
    });
}
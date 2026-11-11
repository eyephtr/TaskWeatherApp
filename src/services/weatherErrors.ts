export type WeatherErrorKind =
    | 'network'
    | 'timeout'
    | 'server'
    | 'invalid'
    | 'aborted'
    | 'unknown';

export interface WeatherError extends Error {
    kind: WeatherErrorKind;
    status?: number;
}

export function createWeatherError(kind: WeatherErrorKind, status?: number): WeatherError {
    const error = new Error(kind) as WeatherError;
    error.name = 'WeatherError';
    error.kind = kind;
    error.status = status;
    return error;
}

export const isWeatherError = (e: unknown): e is WeatherError =>
    e instanceof Error && e.name === 'WeatherError';

const MESSAGES: Record<WeatherErrorKind, string> = {
    network: 'No internet connection. Check your connection and try again.',
    timeout: 'The weather service took too long to respond. Please try again.',
    server: 'The weather service is having problems right now. Please try again later.',
    invalid: 'The weather service sent data we could not read. Please try again.',
    aborted: 'The request was cancelled.',
    unknown: 'Something went wrong while loading the weather.',
};

export const weatherErrorMessage = (kind: WeatherErrorKind): string => MESSAGES[kind];
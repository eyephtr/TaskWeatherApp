import { DEFAULT_LOCATION } from '../services/weatherConfig';
import type { GeoLocation, WeatherData, WeatherResult } from '../types/weather';

export const bangkok: GeoLocation = DEFAULT_LOCATION;
export const chiangMai: GeoLocation = { name: 'Chiang Mai', latitude: 18.7883, longitude: 98.9853 };

export const rawResponse = {
    latitude: 13.75,
    longitude: 100.5,
    current: {
        time: '2026-11-11T14:00',
        interval: 900,
        temperature_2m: 31.2,
        apparent_temperature: 36.1,
        relative_humidity_2m: 62,
        precipitation: 0,
        weather_code: 2,
        wind_speed_10m: 11.4,
        is_day: 1,
    },
    daily: {
        time: ['2026-11-11', '2026-11-12'],
        weather_code: [2, 61],
        temperature_2m_max: [33.1, 32.4],
        temperature_2m_min: [25.0, 24.8],
        precipitation_sum: [0, 4.2],
        precipitation_probability_max: [10, 70],
    },
};

export function makeResult(over: Partial<WeatherResult> = {}): WeatherResult {
    return {
        location: bangkok,
        current: {
            temperature: 31,
            apparentTemperature: 36,
            humidity: 62,
            windSpeed: 11,
            precipitation: 0,
            weatherCode: 2,
            isDay: true,
        },
        daily: [
            {
                date: '2026-11-11',
                weatherCode: 2,
                tempMax: 33,
                tempMin: 25,
                precipitationSum: 0,
                precipitationProbability: 10,
            },
        ],
        ...over,
    };
}

export const makeWeather = (fetchedAt: number, over: Partial<WeatherResult> = {}): WeatherData => ({
    ...makeResult(over),
    fetchedAt,
});
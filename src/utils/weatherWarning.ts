import type { Task } from '../types/task';
import type { DailyForecast } from '../types/weather';
import { isRainCode } from '../services/weatherCodes';

export type WarningKind = 'rain' | 'heat';

export interface WeatherWarning {
    kind: WarningKind;
    label: string;
    message: string; 
}

export const RAIN_PROBABILITY_WARNING = 60; // %
export const HEAT_WARNING_C = 36; 

export function getWeatherWarning(
    task: Task,
    forecast: DailyForecast[] | undefined,
): WeatherWarning | null {
    if (!task.outdoor || task.done || !forecast) {
        return null;
    }
    const day = forecast.find(d => d.date === task.date);
    if (!day) {
        return null;
    }

    const chance = Math.round(day.precipitationProbability);
    if (isRainCode(day.weatherCode) || chance >= RAIN_PROBABILITY_WARNING) {
        return {
            kind: 'rain',
            label: chance > 0 ? `Rain likely · ${chance}%` : 'Rain likely',
            message: 'Rain is forecast for this day. Consider rescheduling or bringing an umbrella.',
        };
    }

    if (day.tempMax >= HEAT_WARNING_C) {
        return {
            kind: 'heat',
            label: `Very hot · ${Math.round(day.tempMax)}°`,
            message: 'It will be very hot on this day. Stay hydrated and avoid the midday sun.',
        };
    }

    return null;
}
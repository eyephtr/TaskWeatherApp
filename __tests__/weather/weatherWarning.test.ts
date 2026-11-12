import {
    getWeatherWarning,
    HEAT_WARNING_C,
    RAIN_PROBABILITY_WARNING,
} from '../../src/utils/weatherWarning';
import type { Task } from '../../src/types/task';
import type { DailyForecast } from '../../src/types/weather';

const task = (over: Partial<Task> = {}): Task => ({
    id: 't1',
    title: 'Jog in the park',
    date: '2026-11-12',
    start: '17:00',
    tag: 'Health',
    priority: 'medium',
    done: false,
    outdoor: true,
    subtasks: [],
    createdAt: 0,
    updatedAt: 0,
    ...over,
});

const day = (over: Partial<DailyForecast> = {}): DailyForecast => ({
    date: '2026-11-12',
    weatherCode: 2,
    tempMax: 32,
    tempMin: 25,
    precipitationSum: 0,
    precipitationProbability: 10,
    ...over,
});

describe('getWeatherWarning', () => {
    it('warns about rain when the weather code is rainy', () => {
        const w = getWeatherWarning(task(), [day({ weatherCode: 61, precipitationProbability: 80 })]);
        expect(w?.kind).toBe('rain');
        expect(w?.label).toBe('Rain likely · 80%');
    });

    it('warns about rain from a high probability even with a clear code', () => {
        const w = getWeatherWarning(task(), [day({ precipitationProbability: RAIN_PROBABILITY_WARNING })]);
        expect(w?.kind).toBe('rain');
    });

    it('warns about heat', () => {
        const w = getWeatherWarning(task(), [day({ tempMax: HEAT_WARNING_C })]);
        expect(w).toMatchObject({ kind: 'heat', label: 'Very hot · 36°' });
    });

    it('prefers the rain warning when both apply', () => {
        const w = getWeatherWarning(task(), [day({ weatherCode: 95, tempMax: 38 })]);
        expect(w?.kind).toBe('rain');
    });

    it('does not warn for mild weather', () => {
        expect(getWeatherWarning(task(), [day()])).toBeNull();
        expect(
            getWeatherWarning(task(), [day({ precipitationProbability: RAIN_PROBABILITY_WARNING - 1 })]),
        ).toBeNull();
    });

    it('ignores tasks that are not outdoor or are already done', () => {
        const rainy = [day({ weatherCode: 63 })];
        expect(getWeatherWarning(task({ outdoor: false }), rainy)).toBeNull();
        expect(getWeatherWarning(task({ done: true }), rainy)).toBeNull();
    });

    it('returns null without a forecast for the task date', () => {
        expect(getWeatherWarning(task(), undefined)).toBeNull();
        expect(getWeatherWarning(task(), [])).toBeNull();
        expect(getWeatherWarning(task({ date: '2026-12-01' }), [day({ weatherCode: 63 })])).toBeNull();
    });

    it('matches the forecast by date, not by position', () => {
        const days = [day({ date: '2026-11-11', weatherCode: 63 }), day({ date: '2026-11-12' })];
        expect(getWeatherWarning(task(), days)).toBeNull();
        expect(getWeatherWarning(task({ date: '2026-11-11' }), days)?.kind).toBe('rain');
    });
});
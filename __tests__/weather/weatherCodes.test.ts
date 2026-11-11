import { describeWeather, isRainCode } from '../../src/services/weatherCodes';
import { isFresh } from '../../src/utils/cache';

describe('describeWeather', () => {
    it('describes clear weather differently by day and night', () => {
        expect(describeWeather(0, true)).toEqual({ label: 'Clear sky', icon: 'sunny' });
        expect(describeWeather(0, false)).toEqual({ label: 'Clear sky', icon: 'moon' });
    });

    it('maps rain, storms and unknown codes', () => {
        expect(describeWeather(61).icon).toBe('rainy');
        expect(describeWeather(95).icon).toBe('thunderstorm');
        expect(describeWeather(999)).toEqual({ label: 'Unknown', icon: 'cloudy' });
    });
});

describe('isRainCode', () => {
    it('flags rainy codes only', () => {
        expect([51, 63, 80, 95, 99].every(isRainCode)).toBe(true);
        expect([0, 3, 45, 71].some(isRainCode)).toBe(false);
    });
});

describe('isFresh', () => {
    const MIN = 60 * 1000;
    it('is fresh under the ttl and stale at or after it', () => {
        expect(isFresh(0, 9 * MIN, 10 * MIN)).toBe(true);
        expect(isFresh(0, 10 * MIN, 10 * MIN)).toBe(false);
        expect(isFresh(0, 11 * MIN, 10 * MIN)).toBe(false);
    });

    it('treats timestamps from the future as not fresh', () => {
        expect(isFresh(5 * MIN, 0, 10 * MIN)).toBe(false);
    });
});
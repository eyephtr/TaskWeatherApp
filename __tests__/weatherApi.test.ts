import { buildWeatherUrl, fetchWeather, parseWeather, type FetchLike } from '../src/services/weatherApi';
import { bangkok, rawResponse } from '../src/test-utils/weatherFixtures';

const respond = (body: unknown, ok = true, status = 200): FetchLike =>
    async () => ({ ok, status, json: async () => body });

const hang: FetchLike = (_url, init) =>
    new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')));
    });

describe('buildWeatherUrl', () => {
    it('includes coordinates, variables and timezone', () => {
        const url = buildWeatherUrl(bangkok);
        expect(url).toContain('https://api.open-meteo.com/v1/forecast?');
        expect(url).toContain('latitude=13.7563');
        expect(url).toContain('longitude=100.5018');
        expect(url).toContain('timezone=auto');
        expect(url).toContain('forecast_days=5');
        expect(url).toContain(encodeURIComponent('temperature_2m'));
    });
});

describe('parseWeather', () => {
    it('maps a valid response to the app model', () => {
        const result = parseWeather(rawResponse, bangkok);
        expect(result.current.temperature).toBe(31.2);
        expect(result.current.isDay).toBe(true);
        expect(result.daily).toHaveLength(2);
        expect(result.daily[1]).toMatchObject({ date: '2026-11-12', weatherCode: 61, precipitationProbability: 70 });
    });

    it('rejects malformed responses as invalid', () => {
        expect(() => parseWeather(null, bangkok)).toThrow();
        expect(() => parseWeather({}, bangkok)).toThrow();
        expect(() => parseWeather({ current: { temperature_2m: 'hot' }, daily: {} }, bangkok)).toThrow();
        expect(() =>
            parseWeather({ current: rawResponse.current, daily: { time: [] } }, bangkok),
        ).toThrow();
    });

    it('fills optional numbers with safe defaults', () => {
        const raw = {
            current: { temperature_2m: 20, weather_code: 0, is_day: 0 },
            daily: { time: ['2026-11-11'], weather_code: [0], temperature_2m_max: [25], temperature_2m_min: [18] },
        };
        const result = parseWeather(raw, bangkok);
        expect(result.current.humidity).toBe(0);
        expect(result.current.isDay).toBe(false);
        expect(result.daily[0].precipitationProbability).toBe(0);
    });
});

describe('fetchWeather', () => {
    it('returns parsed data on success', async () => {
        const result = await fetchWeather(bangkok, { fetchFn: respond(rawResponse) });
        expect(result.current.weatherCode).toBe(2);
    });

    it('reports server errors with the status code', async () => {
        await expect(fetchWeather(bangkok, { fetchFn: respond({}, false, 503) })).rejects.toMatchObject({
            kind: 'server',
            status: 503,
        });
    });

    it('reports network failures', async () => {
        const offline: FetchLike = async () => {
            throw new TypeError('Network request failed');
        };
        await expect(fetchWeather(bangkok, { fetchFn: offline })).rejects.toMatchObject({ kind: 'network' });
    });

    it('reports unreadable bodies as invalid', async () => {
        const badJson: FetchLike = async () => ({
            ok: true,
            status: 200,
            json: async () => {
                throw new SyntaxError('Unexpected token');
            },
        });
        await expect(fetchWeather(bangkok, { fetchFn: badJson })).rejects.toMatchObject({ kind: 'invalid' });
        await expect(fetchWeather(bangkok, { fetchFn: respond({ nope: 1 }) })).rejects.toMatchObject({
            kind: 'invalid',
        });
    });

    it('times out when the service never responds', async () => {
        jest.useFakeTimers();
        try {
            const promise = fetchWeather(bangkok, { fetchFn: hang, timeoutMs: 1000 });
            const assertion = expect(promise).rejects.toMatchObject({ kind: 'timeout' });
            jest.advanceTimersByTime(1000);
            await assertion;
        } finally {
            jest.useRealTimers();
        }
    });

    it('reports a caller abort as aborted', async () => {
        const controller = new AbortController();
        const promise = fetchWeather(bangkok, { fetchFn: hang, signal: controller.signal });
        controller.abort();
        await expect(promise).rejects.toMatchObject({ kind: 'aborted' });
    });
});
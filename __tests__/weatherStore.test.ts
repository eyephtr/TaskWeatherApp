import { createWeatherStore } from '../src/store/weatherStore';
import { createWeatherCache } from '../src/storage/weatherCache';
import { createMemoryKv } from '../src/test-utils/memoryKv';
import { bangkok, chiangMai, makeResult, makeWeather } from '../src/test-utils/weatherFixtures';
import { createWeatherError } from '../src/services/weatherErrors';
import type { GeoLocation, WeatherResult } from '../src/types/weather';

const MIN = 60 * 1000;
const flush = () => new Promise<void>(resolve => setTimeout(() => resolve(), 0));

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(r => {
        resolve = r;
    });
    return { promise, resolve };
}

function setup() {
    const clock = { now: 1800000000000 };
    const cache = createWeatherCache(createMemoryKv());
    const fetchWeather = jest.fn();
    const store = createWeatherStore({ fetchWeather, cache, now: () => clock.now });
    return { store, cache, fetchWeather, clock };
}

describe('weather store', () => {
    it('loads from the API when nothing is cached, then saves to the cache', async () => {
        const { store, fetchWeather, cache } = setup();
        const gate = deferred<WeatherResult>();
        fetchWeather.mockReturnValue(gate.promise);

        const pending = store.getState().load();
        await flush();
        expect(store.getState().status).toBe('loading');
        gate.resolve(makeResult());
        await pending;

        expect(store.getState().status).toBe('success');
        expect(store.getState().data?.current.temperature).toBe(31);
        expect(fetchWeather).toHaveBeenCalledTimes(1);
        expect(await cache.read(bangkok)).not.toBeNull();
    });

    it('uses the cache without calling the API while it is under 10 minutes old', async () => {
        const { store, fetchWeather, cache, clock } = setup();
        await cache.write(makeWeather(clock.now - 5 * MIN));

        await store.getState().load();

        expect(fetchWeather).not.toHaveBeenCalled();
        expect(store.getState().status).toBe('success');
        expect(store.getState().isStale).toBe(false);
    });

    it('calls the API again once the cache is older than 10 minutes', async () => {
        const { store, fetchWeather, cache, clock } = setup();
        await cache.write(makeWeather(clock.now - 11 * MIN));
        const base = makeResult();
        fetchWeather.mockResolvedValue({ ...base, current: { ...base.current, temperature: 20 } });

        await store.getState().load();

        expect(fetchWeather).toHaveBeenCalledTimes(1);
        expect(store.getState().data?.current.temperature).toBe(20);
        expect(store.getState().data?.fetchedAt).toBe(clock.now);
    });

    it('skips the fresh cache when a refresh is forced', async () => {
        const { store, fetchWeather, cache, clock } = setup();
        await cache.write(makeWeather(clock.now - MIN));
        fetchWeather.mockResolvedValue(makeResult());

        await store.getState().load({ force: true });

        expect(fetchWeather).toHaveBeenCalledTimes(1);
    });

    it('shows saved data and flags it when a refresh fails', async () => {
        const { store, fetchWeather, cache, clock } = setup();
        const old = makeWeather(clock.now - 30 * MIN);
        await cache.write(old);
        fetchWeather.mockRejectedValue(createWeatherError('network'));

        await store.getState().load();

        const state = store.getState();
        expect(state.status).toBe('success');
        expect(state.isStale).toBe(true);
        expect(state.errorKind).toBe('network');
        expect(state.data?.fetchedAt).toBe(old.fetchedAt);
    });

    it('shows an error when there is nothing to show, and recovers on retry', async () => {
        const { store, fetchWeather } = setup();
        fetchWeather.mockRejectedValueOnce(createWeatherError('timeout'));

        await store.getState().load();
        expect(store.getState().status).toBe('error');
        expect(store.getState().errorMessage).toBeTruthy();
        expect(store.getState().data).toBeNull();

        fetchWeather.mockResolvedValue(makeResult());
        await store.getState().load();
        expect(store.getState().status).toBe('success');
        expect(store.getState().errorMessage).toBeNull();
    });

    it('does not start a second request while one is running', async () => {
        const { store, fetchWeather } = setup();
        const gate = deferred<WeatherResult>();
        fetchWeather.mockReturnValue(gate.promise);

        const first = store.getState().load();
        const second = store.getState().load();
        gate.resolve(makeResult());
        await Promise.all([first, second]);

        expect(fetchWeather).toHaveBeenCalledTimes(1);
    });

    it('ignores a late response after the location changed', async () => {
        const { store, fetchWeather } = setup();
        const slow = deferred<WeatherResult>();
        const quick = deferred<WeatherResult>();
        const signals: AbortSignal[] = [];
        fetchWeather.mockImplementation((location: GeoLocation, signal: AbortSignal) => {
            signals.push(signal);
            return location.name === 'Bangkok' ? slow.promise : quick.promise;
        });

        const first = store.getState().load();
        await flush();
        const second = store.getState().setLocation(chiangMai);
        await flush();

        quick.resolve(makeResult({ location: chiangMai }));
        await second;
        slow.resolve(makeResult());
        await first;

        expect(signals[0].aborted).toBe(true);
        expect(store.getState().data?.location.name).toBe('Chiang Mai');
    });
});
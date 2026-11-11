import { createWeatherCache } from '../../src/storage/weatherCache';
import { createMemoryKv } from '../../src/test-utils/memoryKv';
import { bangkok, chiangMai, makeWeather } from '../../src/test-utils/weatherFixtures';

describe('weather cache', () => {
    it('round-trips data for a location', async () => {
        const cache = createWeatherCache(createMemoryKv());
        const data = makeWeather(123);
        await cache.write(data);
        expect(await cache.read(bangkok)).toEqual(data);
    });

    it('keeps locations separate', async () => {
        const cache = createWeatherCache(createMemoryKv());
        await cache.write(makeWeather(1));
        expect(await cache.read(chiangMai)).toBeNull();
    });

    it('returns null for empty, corrupted or malformed entries', async () => {
        const kv = createMemoryKv();
        const cache = createWeatherCache(kv);
        expect(await cache.read(bangkok)).toBeNull();

        await cache.write(makeWeather(1));
        const stored = Object.keys(kv.data)[0];
        kv.data[stored] = '{not json';
        expect(await cache.read(bangkok)).toBeNull();
        kv.data[stored] = JSON.stringify({ hello: 'world' });
        expect(await cache.read(bangkok)).toBeNull();
    });
});
import { isThemeMode, loadThemeMode, saveThemeMode } from '../src/storage/themePreference';
import { createMemoryKv } from '../src/test-utils/memoryKv';

describe('theme preference', () => {
    it('defaults to system when nothing is saved', async () => {
        expect(await loadThemeMode(createMemoryKv())).toBe('system');
    });

    it('round-trips a saved mode', async () => {
        const kv = createMemoryKv();
        await saveThemeMode(kv, 'dark');
        expect(await loadThemeMode(kv)).toBe('dark');
    });

    it('falls back to system for an invalid stored value', async () => {
        expect(await loadThemeMode(createMemoryKv({ themeMode: 'purple' }))).toBe('system');
    });

    it('validates modes', () => {
        expect(isThemeMode('light')).toBe(true);
        expect(isThemeMode('auto')).toBe(false);
    });
});
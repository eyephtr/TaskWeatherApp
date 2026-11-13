import type { KeyValueStore } from './keyValueStore';

export type ThemeMode = 'system' | 'light' | 'dark';

const KEY = 'themeMode';

export const isThemeMode = (v: unknown): v is ThemeMode =>
    v === 'system' || v === 'light' || v === 'dark';

export async function loadThemeMode(kv: KeyValueStore): Promise<ThemeMode> {
    try {
        const raw = await kv.getItem(KEY);
        return isThemeMode(raw) ? raw : 'system';
    } catch {
        return 'system';
    }
}

export function saveThemeMode(kv: KeyValueStore, mode: ThemeMode): Promise<void> {
    return kv.setItem(KEY, mode).catch(() => undefined);
}
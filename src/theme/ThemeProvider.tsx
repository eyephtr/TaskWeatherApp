import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { appStorage } from '../storage/appStorage';
import { loadThemeMode, saveThemeMode, type ThemeMode } from '../storage/themePreference';

import { darkColors, lightColors, type ThemeColors } from './tokens';

interface Theme {
    isDark: boolean;
    colors: ThemeColors;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<Theme>({
    isDark: false,
    colors: lightColors,
    mode: 'system',
    setMode: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const scheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        let active = true;
        loadThemeMode(appStorage).then(saved => {
            if (active) {
                setModeState(saved);
            }
        });
        return () => {
            active = false;
        };
    }, []);

    const setMode = useCallback((next: ThemeMode) => {
        setModeState(next);
        saveThemeMode(appStorage, next);
    }, []);

    const value = useMemo<Theme>(() => {
        const isDark = mode === 'system' ? scheme === 'dark' : mode === 'dark';
        return { isDark, colors: isDark ? darkColors : lightColors, mode, setMode };
    }, [mode, scheme, setMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
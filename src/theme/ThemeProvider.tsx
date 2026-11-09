import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from './tokens';

interface Theme {
    isDark: boolean;
    colors: ThemeColors;
}

const ThemeContext = createContext<Theme>({ isDark: false, colors: lightColors });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const scheme = useColorScheme();
    const value = useMemo<Theme>(() => {
        const isDark = scheme === 'dark';
        return { isDark, colors: isDark ? darkColors : lightColors };
    }, [scheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
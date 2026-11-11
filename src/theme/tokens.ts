export const palette = {
    white: '#FFFFFF',
    
    peachPuff: '#FFDAB9',
    petalPink: '#FFD1DC',
    matteCoral: '#E2725B',
    bistre: '#3D2B1F',
    raelynn: '#FFE58F',
    linenCream: '#F4EBD9',
    laurelGreen: '#A8BB9A',
    subtlePurple: '#D5D0E0',

    mutedOffWhite: '#FBF6EC',
    armyBrown: '#5A4030',
} as const;

export interface ThemeColors {
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    onPrimary: string;
    success: string;
    onSuccess: string;
    warning: string;
    onWarning: string;
    danger: string;
    onDanger: string;
    weatherCard: string;
    onWeatherCard: string;
    accentSoft: string;
    priorityHigh: string;
    priorityMedium: string;
    priorityLow: string;
    ring: string;
    agendaInk: string;
    agendaInkMuted: string;
    agendaOverdue: string;
}

export const lightColors: ThemeColors = {
    surface: palette.mutedOffWhite,
    surfaceAlt: palette.peachPuff,
    text: palette.bistre,
    textMuted: '#7A6657', // derived
    border: '#E3D5BC', // derived
    primary: palette.matteCoral,
    onPrimary: palette.bistre,
    success: palette.laurelGreen,
    onSuccess: palette.bistre,
    warning: palette.raelynn,
    onWarning: palette.bistre,
    danger: '#B5402B', // derived
    onDanger: palette.white,
    weatherCard: palette.subtlePurple,
    onWeatherCard: palette.bistre,
    accentSoft: palette.armyBrown,
    priorityHigh: palette.matteCoral,
    priorityMedium: palette.raelynn,
    priorityLow: palette.laurelGreen,
    ring: palette.bistre,
    agendaInk: '#3D2B1F',
    agendaInkMuted: '#7A6657',
    agendaOverdue: '#B5402B',
};

export const darkColors: ThemeColors = {
    surface: palette.bistre,
    surfaceAlt: '#4D392C', // derived
    text: palette.linenCream,
    textMuted: palette.subtlePurple,
    border: '#5A4535', // derived
    primary: palette.matteCoral,
    onPrimary: '#2A1D15', // derived
    success: palette.laurelGreen,
    onSuccess: '#2A1D15', // derived
    warning: palette.raelynn,
    onWarning: '#2A1D15', // derived
    danger: '#FF9C8A', // derived
    onDanger: '#2A1D15', // derived
    weatherCard: '#4A4258', // derived
    onWeatherCard: palette.linenCream,
    accentSoft: palette.petalPink,
    priorityHigh: palette.matteCoral,
    priorityMedium: palette.raelynn,
    priorityLow: palette.laurelGreen,
    ring: palette.raelynn,
    agendaInk: '#D4B8A8',
    agendaInkMuted: '#C4A090',
    agendaOverdue: '#E07060',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;
export const fontSize = { caption: 12, body: 16, title: 22, display: 32 } as const;
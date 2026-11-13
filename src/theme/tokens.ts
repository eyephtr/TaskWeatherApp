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

    purple: '#C9B8E8',
    indigo: '#AEB6E8',
    blue: '#A9CDEF',
    green: '#B5D6B2',
    yellow: '#F9E08B',
    orange: '#FFC999',
    red: '#F0A29A',
    pink: '#F7C1D4',
} as const;

export interface ThemeColors {
    background: string;
    onInverse: string;
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
    field: string;
    agendaInk: string;
    agendaInkMuted: string;
    agendaOverdue: string;
}

export const lightColors: ThemeColors = {
    background: palette.raelynn,
    onInverse: palette.raelynn,
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
    field: palette.linenCream,
    agendaInk: '#3D2B1F',
    agendaInkMuted: '#6B5546',
    agendaOverdue: '#B5402B',
};

export const darkColors: ThemeColors = {
    background: '#2A1D15',
    onInverse: palette.bistre,
    surface: '#4A372B',
    surfaceAlt: '#5C4636', // derived
    text: palette.linenCream,
    textMuted: palette.subtlePurple,
    border: '#6B5342', // derived
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
    accentSoft: palette.armyBrown,
    priorityHigh: palette.matteCoral,
    priorityMedium: palette.raelynn,
    priorityLow: palette.laurelGreen,
    ring: palette.raelynn,
    field: '#5C4636',
    agendaInk: '#3D2B1F',
    agendaInkMuted: '#6B5546',
    agendaOverdue: '#B5402B',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;
export const fontSize = { caption: 12, body: 16, title: 22, display: 32 } as const;

export const TASK_COLORS = {
    purple: palette.purple,
    indigo: palette.indigo,
    blue: palette.blue,
    green: palette.green,
    yellow: palette.yellow,
    orange: palette.orange,
    red: palette.red,
    pink: palette.pink,
} as const;

export const TASK_DOT_COLORS: Record<TaskColorKey, string> = {
    purple: '#8E6FD1',
    indigo: '#6672D6',
    blue: '#4A90D9',
    green: '#4FA36A',
    yellow: '#D9A400',
    orange: '#E8821A',
    red: '#D64545',
    pink: '#E0709A',
};

export type TaskColorKey = keyof typeof TASK_COLORS;
export const TASK_COLOR_KEYS = Object.keys(TASK_COLORS) as TaskColorKey[];
export const DEFAULT_TASK_COLOR: TaskColorKey = 'purple';
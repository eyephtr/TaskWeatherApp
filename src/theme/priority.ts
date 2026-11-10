import type { Priority } from '../types/task';
import { palette } from './tokens';

export const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low'];

export const PRIORITY_LABEL: Record<Priority, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

export const PRIORITY_COLOR: Record<Priority, string> = {
    high: palette.petalPink,
    medium: palette.peachPuff,
    low: palette.subtlePurple,
};
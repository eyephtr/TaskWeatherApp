import type { Priority } from '../types/task';
import { palette } from './tokens';

export const PRIORITIES: Priority[] = ['high', 'medium', 'low', 'none'];

export const FLAG_COLOR: Record<Exclude<Priority, 'none'>, string> = {
    high: '#D64545',
    medium: '#E8921A',
    low: '#3E9B6A',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    none: 'None',
};

export const PRIORITY_COLOR: Record<Priority, string> = {
    high: palette.petalPink,
    medium: palette.peachPuff,
    low: palette.subtlePurple,
    none: palette.linenCream,
};
import { FLAG_COLOR, PRIORITIES, PRIORITY_COLOR, PRIORITY_LABEL } from '../src/theme/priority';
import { DEFAULT_TASK_COLOR, TASK_COLORS, TASK_COLOR_KEYS } from '../src/theme/tokens';

describe('priority theme', () => {
    it('includes none as the last option', () => {
        expect(PRIORITIES).toContain('none');
        expect(PRIORITIES[PRIORITIES.length - 1]).toBe('none');
    });

    it('has a color and a label for every priority', () => {
        PRIORITIES.forEach(p => {
            expect(PRIORITY_COLOR[p]).toBeTruthy();
            expect(PRIORITY_LABEL[p]).toBeTruthy();
        });
    });

    it('has a flag color for every priority except none', () => {
        PRIORITIES.filter(p => p !== 'none').forEach(p => {
            expect(FLAG_COLOR[p as keyof typeof FLAG_COLOR]).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
        expect((FLAG_COLOR as Record<string, string>).none).toBeUndefined();
    });
});

describe('task colors', () => {
    it('offers the eight hues', () => {
        expect(TASK_COLOR_KEYS).toEqual([
            'purple', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red', 'pink',
        ]);
    });

    it('has a valid hex value for every key', () => {
        TASK_COLOR_KEYS.forEach(k => expect(TASK_COLORS[k]).toMatch(/^#[0-9A-Fa-f]{6}$/));
    });

    it('uses unique colors', () => {
        expect(new Set(TASK_COLOR_KEYS.map(k => TASK_COLORS[k])).size).toBe(TASK_COLOR_KEYS.length);
    });

    it('has a default that exists in the palette', () => {
        expect(TASK_COLOR_KEYS).toContain(DEFAULT_TASK_COLOR);
    });
});
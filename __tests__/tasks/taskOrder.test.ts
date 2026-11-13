import { PRIORITY_RANK, getTimeMode, sortTasks } from '../../src/utils/taskOrder';
import type { Task } from '../../src/types/task';

const make = (over: Partial<Task>): Task => ({
    id: 'x',
    title: 'Task',
    date: '2026-11-10',
    start: '09:00',
    tag: 'General',
    priority: 'medium',
    done: false,
    outdoor: false,
    subtasks: [],
    createdAt: 0,
    updatedAt: 0,
    ...over,
});

const ids = (list: Task[]) => list.map(t => t.id);

describe('PRIORITY_RANK', () => {
    it('ranks high before medium before low before none', () => {
        expect(PRIORITY_RANK.high).toBeLessThan(PRIORITY_RANK.medium);
        expect(PRIORITY_RANK.medium).toBeLessThan(PRIORITY_RANK.low);
        expect(PRIORITY_RANK.low).toBeLessThan(PRIORITY_RANK.none);
    });
});

describe('sortTasks (default: time first)', () => {
    it('sorts by start time', () => {
        const input = [make({ id: 'b', start: '10:00' }), make({ id: 'a', start: '08:00' })];
        expect(ids(sortTasks(input, false))).toEqual(['a', 'b']);
    });

    it('puts higher priority first when start times are equal', () => {
        const input = [
            make({ id: 'none', priority: 'none' }),
            make({ id: 'low', priority: 'low' }),
            make({ id: 'high', priority: 'high' }),
            make({ id: 'med', priority: 'medium' }),
        ];
        expect(ids(sortTasks(input, false))).toEqual(['high', 'med', 'low', 'none']);
    });

    it('lets time win over priority', () => {
        const input = [
            make({ id: 'late-high', start: '10:00', priority: 'high' }),
            make({ id: 'early-none', start: '08:00', priority: 'none' }),
        ];
        expect(ids(sortTasks(input, false))).toEqual(['early-none', 'late-high']);
    });

    it('does not mutate the input', () => {
        const input = [make({ id: 'b', start: '10:00' }), make({ id: 'a', start: '08:00' })];
        sortTasks(input, false);
        expect(ids(input)).toEqual(['b', 'a']);
    });

    it('returns an empty list for an empty input', () => {
        expect(sortTasks([], false)).toEqual([]);
    });
});

describe('sortTasks (priority mode)', () => {
    it('sorts high to none regardless of time', () => {
        const input = [
            make({ id: 'none', start: '08:00', priority: 'none' }),
            make({ id: 'low', start: '09:00', priority: 'low' }),
            make({ id: 'high', start: '23:00', priority: 'high' }),
        ];
        expect(ids(sortTasks(input, true))).toEqual(['high', 'low', 'none']);
    });

    it('uses start time as the tie-breaker within the same priority', () => {
        const input = [
            make({ id: 'b', start: '11:00', priority: 'high' }),
            make({ id: 'a', start: '08:00', priority: 'high' }),
        ];
        expect(ids(sortTasks(input, true))).toEqual(['a', 'b']);
    });

    it('does not mutate the input', () => {
        const input = [make({ id: 'b', priority: 'low' }), make({ id: 'a', priority: 'high' })];
        sortTasks(input, true);
        expect(ids(input)).toEqual(['b', 'a']);
    });
});

describe('getTimeMode', () => {
    const list = [
        make({ id: '1', start: '09:00' }),
        make({ id: '2', start: '09:00' }),
        make({ id: '3', start: '09:00' }),
        make({ id: '4', start: '13:00' }),
    ];
    const normal = { searching: false, byPriority: false };

    it('shows the time on the first row', () => {
        expect(getTimeMode(list, 0, normal)).toBe('show');
    });

    it('blanks the time for rows that share the previous start time', () => {
        expect(getTimeMode(list, 1, normal)).toBe('blank');
        expect(getTimeMode(list, 2, normal)).toBe('blank');
    });

    it('shows the time again when the start time changes', () => {
        expect(getTimeMode(list, 3, normal)).toBe('show');
    });

    it('hides all times in priority mode', () => {
        expect(getTimeMode(list, 0, { searching: false, byPriority: true })).toBe('hide');
        expect(getTimeMode(list, 1, { searching: false, byPriority: true })).toBe('hide');
    });

    it('always shows times while searching', () => {
        expect(getTimeMode(list, 1, { searching: true, byPriority: false })).toBe('show');
        expect(getTimeMode(list, 1, { searching: true, byPriority: true })).toBe('show');
    });
});
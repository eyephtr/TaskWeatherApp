import { filterTasks, matchesQuery } from '../../src/utils/taskFilters';
import { sortByDateTime, sortByStart } from '../../src/utils/taskSelectors';
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

const tasks: Task[] = [
    make({ id: '1', title: 'Send report', tag: 'Work', done: false }),
    make({
        id: '2',
        title: 'Lunch with Michael',
        tag: 'Meeting',
        done: true,
        subtasks: [{ id: 's1', title: 'Discuss trip', done: false }],
    }),
    make({ id: '3', title: 'Morning run', tag: 'Habit', done: true }),
];

describe('filterTasks', () => {
    it('filters by status', () => {
        expect(filterTasks(tasks, { status: 'all', query: '' })).toHaveLength(3);
        expect(filterTasks(tasks, { status: 'active', query: '' }).map(t => t.id)).toEqual(['1']);
        expect(filterTasks(tasks, { status: 'done', query: '' }).map(t => t.id)).toEqual(['2', '3']);
    });

    it('searches title, tag and subtasks case-insensitively', () => {
        expect(filterTasks(tasks, { status: 'all', query: 'REPORT' }).map(t => t.id)).toEqual(['1']);
        expect(filterTasks(tasks, { status: 'all', query: 'habit' }).map(t => t.id)).toEqual(['3']);
        expect(filterTasks(tasks, { status: 'all', query: 'trip' }).map(t => t.id)).toEqual(['2']);
    });

    it('combines status and query', () => {
        expect(filterTasks(tasks, { status: 'active', query: 'run' })).toEqual([]);
        expect(filterTasks(tasks, { status: 'done', query: 'run' }).map(t => t.id)).toEqual(['3']);
    });

    it('treats a blank query as no query', () => {
        expect(matchesQuery(tasks[0], '   ')).toBe(true);
    });

    it('returns an empty list when nothing matches', () => {
        expect(filterTasks(tasks, { status: 'all', query: 'zzz' })).toEqual([]);
    });
});

describe('sorting', () => {
    it('sorts by start time without mutating the input', () => {
        const input = [make({ id: 'b', start: '10:00' }), make({ id: 'a', start: '08:00' })];
        expect(sortByStart(input).map(t => t.id)).toEqual(['a', 'b']);
        expect(input.map(t => t.id)).toEqual(['b', 'a']);
    });

    it('sorts by date and then time', () => {
        const input = [
            make({ id: 'c', date: '2026-11-11', start: '08:00' }),
            make({ id: 'b', date: '2026-11-10', start: '10:00' }),
            make({ id: 'a', date: '2026-11-10', start: '08:00' }),
        ];
        expect(sortByDateTime(input).map(t => t.id)).toEqual(['a', 'b', 'c']);
    });
});
import { isOverdue, taskDeadline } from '../src/utils/taskStatus';
import type { Task } from '../src/types/task';

const make = (over: Partial<Task> = {}): Task => ({
    id: 'x',
    title: 'Task',
    date: '2026-11-10',
    start: '09:00',
    end: '11:00',
    tag: 'General',
    priority: 'medium',
    done: false,
    outdoor: false,
    subtasks: [],
    createdAt: 0,
    updatedAt: 0,
    ...over,
});

const at = (h: number, m = 0, day = 10) => new Date(2026, 10, day, h, m);

describe('isOverdue', () => {
    it('is not overdue before the end time', () => {
        expect(isOverdue(make(), at(10, 0))).toBe(false);
    });

    it('is not overdue exactly at the deadline', () => {
        expect(isOverdue(make(), at(11, 0))).toBe(false);
    });

    it('is overdue once the end time has passed', () => {
        expect(isOverdue(make(), at(11, 1))).toBe(true);
    });

    it('uses the start time when there is no end time', () => {
        const task = make({ end: undefined });
        expect(isOverdue(task, at(9, 1))).toBe(true);
        expect(isOverdue(task, at(8, 59))).toBe(false);
    });

    it('is never overdue when done', () => {
        expect(isOverdue(make({ done: true }), at(23, 0))).toBe(false);
    });

    it('is overdue on later days and not on earlier days', () => {
        expect(isOverdue(make(), at(8, 0, 11))).toBe(true);
        expect(isOverdue(make(), at(23, 0, 9))).toBe(false);
    });
});

describe('taskDeadline', () => {
    it('combines date and end time in local time', () => {
        const d = taskDeadline(make());
        expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([
            2026, 10, 10, 11, 0,
        ]);
    });
});
import type { Task } from '../types/task';

export function groupByDate(tasks: Task[]): Record<string, Task[]> {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
        (map[task.date] ??= []).push(task);
    }
    return map;
}

export const sortByStart = (tasks: Task[]): Task[] =>
    [...tasks].sort((a, b) => a.start.localeCompare(b.start));

export const sortByDateTime = (tasks: Task[]): Task[] =>
    [...tasks].sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
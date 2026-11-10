import type { Task } from '../types/task';

export function groupByDate(tasks: Task[]): Record<string, Task[]> {
    const map: Record<string, Task[]> = {};
    for (const task of tasks) {
        (map[task.date] ??= []).push(task);
    }
    return map;
}
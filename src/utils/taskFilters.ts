import type { Task } from '../types/task';

export type StatusFilter = 'all' | 'active' | 'done';

export interface FilterOptions {
    status: StatusFilter;
    query: string;
}

export function matchesQuery(task: Task, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) {
        return true;
    }
    return (
        task.title.toLowerCase().includes(q) ||
        task.tag.toLowerCase().includes(q) ||
        task.subtasks.some(s => s.title.toLowerCase().includes(q))
    );
}

export function matchesStatus(task: Task, status: StatusFilter): boolean {
    if (status === 'all') {
        return true;
    }
    return status === 'done' ? task.done : !task.done;
}

export function filterTasks(tasks: Task[], { status, query }: FilterOptions): Task[] {
    return tasks.filter(t => matchesStatus(t, status) && matchesQuery(t, query));
}
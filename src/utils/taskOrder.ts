import type { Priority, Task } from '../types/task';

export const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 };

export function sortTasks(tasks: Task[], byPriority: boolean): Task[] {
    return [...tasks].sort((a, b) => {
        const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        const time = a.start.localeCompare(b.start);
        return byPriority ? rank || time : time || rank;
    });
}

export type TimeMode = 'show' | 'blank' | 'hide';

export function getTimeMode(
    list: Task[],
    index: number,
    opts: { searching: boolean; byPriority: boolean },
): TimeMode {
    if (opts.searching) {
        return 'show';
    }
    if (opts.byPriority) {
        return 'hide';
    }
    return index > 0 && list[index - 1].start === list[index].start ? 'blank' : 'show';
}
import type { Task } from '../types/task';
import { fromDateString } from './date';

export function taskDeadline(task: Task): Date {
    const [h, m] = (task.end ?? task.start).split(':').map(Number);
    const deadline = fromDateString(task.date);
    deadline.setHours(h, m, 0, 0);
    return deadline;
}

export function isOverdue(task: Task, now: Date = new Date()): boolean {
    return !task.done && taskDeadline(task).getTime() < now.getTime();
}
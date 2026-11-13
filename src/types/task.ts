import type { TaskColorKey } from '../theme/tokens';

export type Priority = 'none' | 'high' | 'medium' | 'low';

export interface Subtask {
    id: string;
    title: string;
    done: boolean;
}

export interface Task {
    id: string;
    title: string;
    date: string;
    start: string;
    end?: string;
    tag: string;
    priority: Priority;
    color?: TaskColorKey;
    done: boolean;
    outdoor: boolean;
    subtasks: Subtask[];
    createdAt: number;
    updatedAt: number;
}

export interface SubtaskInput {
    id?: string;
    title: string;
    done?: boolean;
}

export interface TaskInput {
    title: string;
    date: string;
    start: string;
    end?: string;
    tag?: string;
    priority: Priority;
    color?: TaskColorKey;
    outdoor?: boolean;
    done?: boolean;
    subtasks?: SubtaskInput[];
}

export type TaskField = 'title' | 'date' | 'start' | 'end' | 'tag';
export type ValidationErrors = Partial<Record<TaskField, string>>;
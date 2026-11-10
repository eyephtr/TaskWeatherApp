export type Priority = 'high' | 'medium' | 'low';

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
    outdoor?: boolean;
    done?: boolean;
    subtasks?: SubtaskInput[];
}

export type TaskField = 'title' | 'date' | 'start' | 'end' | 'tag';
export type ValidationErrors = Partial<Record<TaskField, string>>;
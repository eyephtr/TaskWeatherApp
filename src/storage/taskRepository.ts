import type { Task } from '../types/task';

export interface KeyValueStore {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
}

export interface TaskRepository {
    load(): Promise<Task[]>;
    save(tasks: Task[]): Promise<void>;
}

const STORAGE_KEY = 'tasks';
const SCHEMA_VERSION = 1;

function isStoredTask(value: unknown): value is Task {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const t = value as Record<string, unknown>;
    return (
        typeof t.id === 'string' &&
        typeof t.title === 'string' &&
        typeof t.date === 'string' &&
        typeof t.start === 'string' &&
        Array.isArray(t.subtasks)
    );
}

export function createTaskRepository(kv: KeyValueStore): TaskRepository {
    let queue: Promise<unknown> = Promise.resolve();

    return {
        async load() {
            const raw = await kv.getItem(STORAGE_KEY);
            if (!raw) {
                return [];
            }
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed?.tasks) ? parsed.tasks.filter(isStoredTask) : [];
            } catch {
                return [];
            }
        },

        save(tasks) {
            const write = () =>
                kv.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, tasks }));
            const next = queue.then(write, write);
            queue = next.catch(() => undefined);
            return next;
        },
    };
}
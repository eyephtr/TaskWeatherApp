import type { Task } from '../types/task';
import type { KeyValueStore } from './keyValueStore';

export type { KeyValueStore };
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
        Array.isArray(t.subtasks) &&
        typeof t.priority === 'string' &&
        typeof t.createdAt === 'number' &&
        typeof t.updatedAt === 'number'
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
                if (typeof parsed.version !== 'number' || parsed.version < 1) {
                    return [];
                }
                if (parsed.version > SCHEMA_VERSION) {
                    return [];
                }
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
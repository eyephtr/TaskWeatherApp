import type { KeyValueStore } from '../storage/taskRepository';

export function createMemoryKv(initial: Record<string, string> = {}) {
    const data: Record<string, string> = { ...initial };
    const kv: KeyValueStore & { data: Record<string, string> } = {
        data,
        getItem: async key => data[key] ?? null,
        setItem: async (key, value) => {
            data[key] = value;
        },
    };
    return kv;
}
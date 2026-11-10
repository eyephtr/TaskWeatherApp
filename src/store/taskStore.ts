import { create } from 'zustand';
import type { Task, TaskInput, ValidationErrors } from '../types/task';
import type { TaskRepository } from '../storage/taskRepository';
import { hasErrors, validateTaskInput } from '../utils/taskValidation';
import { createId } from '../utils/id';

const DEFAULT_TAG = 'General';
const LOAD_ERROR = 'Could not load your tasks.';
const SAVE_ERROR = 'Could not save your changes.';

export type TaskResult =
    | { ok: true; task: Task }
    | { ok: false; errors: ValidationErrors; notFound?: boolean };

export interface TaskState {
    tasks: Task[];
    status: 'idle' | 'loading' | 'ready' | 'error';
    error: string | null;
    hydrate: () => Promise<void>;
    addTask: (input: TaskInput) => TaskResult;
    updateTask: (id: string, input: TaskInput) => TaskResult;
    deleteTask: (id: string) => void;
    toggleDone: (id: string) => void;
    toggleSubtask: (taskId: string, subtaskId: string) => void;
    clearError: () => void;
}

function buildTask(
    input: TaskInput,
    meta: { id: string; createdAt: number; updatedAt: number },
    prev?: Task,
): Task {
    return {
        ...meta,
        title: input.title.trim(),
        date: input.date,
        start: input.start,
        end: input.end || undefined,
        tag: input.tag?.trim() || prev?.tag || DEFAULT_TAG,
        priority: input.priority,
        done: input.done ?? prev?.done ?? false,
        outdoor: input.outdoor ?? prev?.outdoor ?? false,
        subtasks: input.subtasks
            ? input.subtasks
                .filter(s => s.title.trim())
                .map(s => ({ id: s.id ?? createId(), title: s.title.trim(), done: s.done ?? false }))
            : prev?.subtasks ?? [],
    };
}

export function createTaskStore(repo: TaskRepository) {
    return create<TaskState>()((set, get) => {
        const persist = () => {
            repo.save(get().tasks).catch(() => set({ error: SAVE_ERROR }));
        };

        const patchTask = (id: string, patch: (t: Task) => Task) => {
            set(s => ({ tasks: s.tasks.map(t => (t.id === id ? patch(t) : t)) }));
            persist();
        };

        return {
            tasks: [],
            status: 'idle',
            error: null,

            hydrate: async () => {
                // กันเรียกซ้ำระหว่างโหลด / โหลดเสร็จแล้ว
                const { status } = get();
                if (status === 'loading' || status === 'ready') {
                    return;
                }
                set({ status: 'loading', error: null });
                try {
                    const tasks = await repo.load();
                    set({ tasks, status: 'ready' });
                } catch {
                    set({ status: 'error', error: LOAD_ERROR });
                }
            },

            addTask: input => {
                const errors = validateTaskInput(input);
                if (hasErrors(errors)) {
                    return { ok: false, errors };
                }
                const now = Date.now();
                const task = buildTask(input, { id: createId(), createdAt: now, updatedAt: now });
                set(s => ({ tasks: [...s.tasks, task] }));
                persist();
                return { ok: true, task };
            },

            updateTask: (id, input) => {
                const prev = get().tasks.find(t => t.id === id);
                if (!prev) {
                    return { ok: false, errors: {}, notFound: true };
                }
                const errors = validateTaskInput(input);
                if (hasErrors(errors)) {
                    return { ok: false, errors };
                }
                const task = buildTask(
                    input,
                    { id, createdAt: prev.createdAt, updatedAt: Date.now() },
                    prev,
                );
                set(s => ({ tasks: s.tasks.map(t => (t.id === id ? task : t)) }));
                persist();
                return { ok: true, task };
            },

            deleteTask: id => {
                set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
                persist();
            },

            toggleDone: id => patchTask(id, t => ({ ...t, done: !t.done, updatedAt: Date.now() })),

            toggleSubtask: (taskId, subtaskId) =>
                patchTask(taskId, t => ({
                    ...t,
                    subtasks: t.subtasks.map(s => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
                    updatedAt: Date.now(),
                })),

            clearError: () => set({ error: null }),
        };
    });
}
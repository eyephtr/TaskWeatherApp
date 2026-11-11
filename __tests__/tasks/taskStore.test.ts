import { createTaskStore } from '../../src/store/taskStore';
import { createTaskRepository } from '../../src/storage/taskRepository';
import { createMemoryKv } from '../../src/test-utils/memoryKv';
import type { TaskInput } from '../../src/types/task';

const input: TaskInput = {
    title: 'Buy milk',
    date: '2026-11-10',
    start: '08:00',
    priority: 'low',
    subtasks: [{ title: 'Check fridge' }],
};

const flush = () => new Promise<void>(resolve => setTimeout(() => resolve(), 0));

function setup(initial: Record<string, string> = {}) {
    const kv = createMemoryKv(initial);
    const repo = createTaskRepository(kv);
    return { kv, repo, store: createTaskStore(repo) };
}

describe('task store', () => {
    it('adds a valid task with defaults', () => {
        const { store } = setup();
        const result = store.getState().addTask(input);
        expect(result.ok).toBe(true);
        const [task] = store.getState().tasks;
        expect(task.done).toBe(false);
        expect(task.tag).toBe('General');
        expect(task.subtasks).toHaveLength(1);
    });

    it('does not add an invalid task and returns errors', () => {
        const { store } = setup();
        const result = store.getState().addTask({ ...input, title: ' ' });
        expect(result.ok).toBe(false);
        expect(store.getState().tasks).toHaveLength(0);
    });

    it('toggles done and subtasks', () => {
        const { store } = setup();
        store.getState().addTask(input);
        const { id, subtasks } = store.getState().tasks[0];

        store.getState().toggleDone(id);
        expect(store.getState().tasks[0].done).toBe(true);

        store.getState().toggleSubtask(id, subtasks[0].id);
        expect(store.getState().tasks[0].subtasks[0].done).toBe(true);
    });

    it('updates and deletes a task', () => {
        const { store } = setup();
        store.getState().addTask(input);
        const { id } = store.getState().tasks[0];

        store.getState().updateTask(id, { ...input, title: 'Buy oat milk' });
        expect(store.getState().tasks[0].title).toBe('Buy oat milk');
        expect(store.getState().updateTask('missing', input).ok).toBe(false);

        store.getState().deleteTask(id);
        expect(store.getState().tasks).toHaveLength(0);
    });

    it('persists changes and restores them on hydrate', async () => {
        const { kv, store } = setup();
        store.getState().addTask(input);
        await flush();

        const restored = createTaskStore(createTaskRepository(createMemoryKv(kv.data)));
        await restored.getState().hydrate();
        expect(restored.getState().status).toBe('ready');
        expect(restored.getState().tasks[0].title).toBe('Buy milk');
    });

    it('starts empty when stored data is corrupted', async () => {
        const { store } = setup({ tasks: '{not json' });
        await store.getState().hydrate();
        expect(store.getState().status).toBe('ready');
        expect(store.getState().tasks).toEqual([]);
    });

    it('does not load twice when hydrate is called repeatedly', async () => {
        const kv = createMemoryKv();
        const getItem = jest.spyOn(kv, 'getItem');
        const store = createTaskStore(createTaskRepository(kv));

        await Promise.all([store.getState().hydrate(), store.getState().hydrate()]);
        expect(getItem).toHaveBeenCalledTimes(1);
    });
});
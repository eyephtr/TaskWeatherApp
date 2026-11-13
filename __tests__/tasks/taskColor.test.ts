import { createTaskStore } from '../../src/store/taskStore';
import { createTaskRepository } from '../../src/storage/taskRepository';
import { createMemoryKv } from '../../src/test-utils/memoryKv';
import type { TaskInput } from '../../src/types/task';

const base: TaskInput = {
    title: 'Paint wall',
    date: '2026-11-10',
    start: '08:00',
    priority: 'medium',
};

const flush = () => new Promise<void>(resolve => setTimeout(() => resolve(), 0));

function setup(initial: Record<string, string> = {}) {
    const kv = createMemoryKv(initial);
    return { kv, store: createTaskStore(createTaskRepository(kv)) };
}

describe('task color', () => {
    it('stores the chosen color', () => {
        const { store } = setup();
        store.getState().addTask({ ...base, color: 'indigo' });
        expect(store.getState().tasks[0].color).toBe('indigo');
    });

    it('leaves color undefined when none is given (legacy behaviour)', () => {
        const { store } = setup();
        store.getState().addTask(base);
        expect(store.getState().tasks[0].color).toBeUndefined();
    });

    it('keeps the previous color when an update omits it', () => {
        const { store } = setup();
        store.getState().addTask({ ...base, color: 'green' });
        const { id } = store.getState().tasks[0];

        store.getState().updateTask(id, { ...base, title: 'Renamed' });
        expect(store.getState().tasks[0].color).toBe('green');
    });

    it('changes the color when an update provides a new one', () => {
        const { store } = setup();
        store.getState().addTask({ ...base, color: 'green' });
        const { id } = store.getState().tasks[0];

        store.getState().updateTask(id, { ...base, color: 'pink' });
        expect(store.getState().tasks[0].color).toBe('pink');
    });

    it('keeps the color when toggling done and subtasks', () => {
        const { store } = setup();
        store.getState().addTask({ ...base, color: 'blue', subtasks: [{ title: 'Step' }] });
        const { id, subtasks } = store.getState().tasks[0];

        store.getState().toggleDone(id);
        store.getState().toggleSubtask(id, subtasks[0].id);
        expect(store.getState().tasks[0].color).toBe('blue');
    });

    it('persists the color and restores it on hydrate', async () => {
        const { kv, store } = setup();
        store.getState().addTask({ ...base, color: 'orange' });
        await flush();

        const restored = createTaskStore(createTaskRepository(createMemoryKv(kv.data)));
        await restored.getState().hydrate();
        expect(restored.getState().tasks[0].color).toBe('orange');
    });
});

describe('priority none', () => {
    it('accepts a task with priority none', () => {
        const { store } = setup();
        const result = store.getState().addTask({ ...base, priority: 'none' });
        expect(result.ok).toBe(true);
        expect(store.getState().tasks[0].priority).toBe('none');
    });

    it('can change a task to none and back', () => {
        const { store } = setup();
        store.getState().addTask(base);
        const { id } = store.getState().tasks[0];

        store.getState().updateTask(id, { ...base, priority: 'none' });
        expect(store.getState().tasks[0].priority).toBe('none');
        store.getState().updateTask(id, { ...base, priority: 'high' });
        expect(store.getState().tasks[0].priority).toBe('high');
    });
});
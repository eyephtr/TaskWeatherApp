import { createTaskRepository } from '../../src/storage/taskRepository';
import { createMemoryKv } from '../../src/test-utils/memoryKv';
import type { Task } from '../../src/types/task';

const make = (over: Partial<Task> = {}): Task => ({
    id: 'a',
    title: 'Task',
    date: '2026-11-10',
    start: '09:00',
    tag: 'General',
    priority: 'medium',
    done: false,
    outdoor: false,
    subtasks: [],
    createdAt: 1,
    updatedAt: 1,
    ...over,
});

const stored = (tasks: unknown[], version = 1) => JSON.stringify({ version, tasks });

describe('task repository', () => {
    it('returns an empty list when nothing is stored', async () => {
        const repo = createTaskRepository(createMemoryKv());
        expect(await repo.load()).toEqual([]);
    });

    it('round-trips tasks including color and priority none', async () => {
        const repo = createTaskRepository(createMemoryKv());
        const tasks = [make({ id: '1', color: 'purple' }), make({ id: '2', priority: 'none' })];
        await repo.save(tasks);
        expect(await repo.load()).toEqual(tasks);
    });

    it('loads legacy tasks that have no color', async () => {
        const legacy = make();
        const repo = createTaskRepository(createMemoryKv({ tasks: stored([legacy]) }));
        const [task] = await repo.load();
        expect(task.id).toBe('a');
        expect(task.color).toBeUndefined();
    });

    it('drops malformed entries but keeps valid ones', async () => {
        const repo = createTaskRepository(
            createMemoryKv({ tasks: stored([make({ id: 'ok' }), { id: 5 }, null, 'x']) }),
        );
        expect((await repo.load()).map(t => t.id)).toEqual(['ok']);
    });

    it('returns an empty list for corrupted JSON', async () => {
        const repo = createTaskRepository(createMemoryKv({ tasks: '{not json' }));
        expect(await repo.load()).toEqual([]);
    });

    it('returns an empty list for a missing or newer schema version', async () => {
        const newer = createTaskRepository(createMemoryKv({ tasks: stored([make()], 99) }));
        expect(await newer.load()).toEqual([]);

        const noVersion = createTaskRepository(
            createMemoryKv({ tasks: JSON.stringify({ tasks: [make()] }) }),
        );
        expect(await noVersion.load()).toEqual([]);
    });

    it('keeps the last write when saves overlap', async () => {
        const repo = createTaskRepository(createMemoryKv());
        await Promise.all([repo.save([make({ id: '1' })]), repo.save([make({ id: '2' })])]);
        expect((await repo.load()).map(t => t.id)).toEqual(['2']);
    });
});
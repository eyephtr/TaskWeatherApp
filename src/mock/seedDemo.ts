import { buildMockTasks } from './mockTasks';
import { useTaskStore } from '../store/useTaskStore';

export function seedDemoTasks() {
    const { addTask } = useTaskStore.getState();
    Object.entries(buildMockTasks()).forEach(([date, list]) =>
        list.forEach(t =>
            addTask({
                title: t.title,
                date,
                start: t.start,
                end: t.end,
                tag: t.tag,
                priority: t.priority,
                done: t.done,
                subtasks: t.subtasks?.map(s => ({ title: s.title, done: s.done })),
            }),
        ),
    );
}
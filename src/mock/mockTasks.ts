import { toDateString } from '../utils/date';

export type MockPriority = 'high' | 'medium' | 'low';

export interface MockSubtask {
    id: string;
    title: string;
    done?: boolean;
}

export interface MockTask {
    id: string;
    title: string;
    start: string;
    end?: string;
    tag: string;
    priority: MockPriority;
    done?: boolean;
    subtasks?: MockSubtask[];
}

export function buildMockTasks(): Record<string, MockTask[]> {
    const now = new Date();
    const at = (offset: number) =>
        toDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));

    return {
        [at(0)]: [
            { id: 'a1', start: '07:00', title: 'Morning run', tag: 'Habit', priority: 'low', done: true },
            {
                id: 'a2',
                start: '09:00',
                end: '10:30',
                title: 'Send project progress report',
                tag: 'Work',
                priority: 'high',
                subtasks: [
                    { id: 'a2-1', title: 'Update the charts' },
                    { id: 'a2-2', title: 'Proofread the summary', done: true },
                ],
            },
            {
                id: 'a3',
                start: '13:00',
                end: '14:00',
                title: 'Lunch with Michael',
                tag: 'Meeting',
                priority: 'medium',
                subtasks: [{ id: 'a3-1', title: 'Discuss trip' }],
            },
            { id: 'a4', start: '15:30', title: 'Call the client', tag: 'Work', priority: 'medium' },
            {
                id: 'a5',
                start: '17:00',
                end: '17:30',
                title: 'Buy a spare umbrella',
                tag: 'Errand',
                priority: 'low',
            },
        ],
        [at(1)]: [
            {
                id: 'b1',
                start: '08:00',
                end: '10:00',
                title: 'Study for the exam',
                tag: 'Study',
                priority: 'high',
                subtasks: [
                    { id: 'b1-1', title: 'Review chapter 3' },
                    { id: 'b1-2', title: 'Practice problems' },
                ],
            },
            {
                id: 'b2',
                start: '14:00',
                end: '15:00',
                title: 'Dentist appointment',
                tag: 'Health',
                priority: 'medium',
            },
        ],
        [at(3)]: [
            { id: 'c1', start: '18:00', title: "Buy a friend's birthday gift", tag: 'Personal', priority: 'medium' },
        ],
        [at(-2)]: [
            { id: 'd1', start: '10:00', title: 'Do the laundry', tag: 'Home', priority: 'low', done: true },
        ],
    };
}
import type { ComponentProps } from 'react';
import type { Ionicons } from '@react-native-vector-icons/ionicons';
import { toDateString } from '../utils/date';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type MockPriority = 'high' | 'medium' | 'low';

export interface MockTask {
    id: string;
    icon: IconName;
    title: string;
    priority: MockPriority;
    done?: boolean;
}

export function buildMockTasks(): Record<string, MockTask[]> {
    const now = new Date();
    const at = (offset: number) =>
        toDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));

    return {
        [at(0)]: [
            { id: 'a1', icon: 'laptop-outline', title: 'Send project progress report', priority: 'high' },
            { id: 'a2', icon: 'call-outline', title: 'Call the client', priority: 'medium', done: true },
            { id: 'a3', icon: 'cart-outline', title: 'Buy groceries', priority: 'low' },
            { id: 'a4', icon: 'walk-outline', title: 'Evening run', priority: 'low' },
            { id: 'a5', icon: 'umbrella-outline', title: 'Buy a spare umbrella', priority: 'medium' },
        ],
        [at(1)]: [
            { id: 'b1', icon: 'book-outline', title: 'Study for the exam', priority: 'high' },
            { id: 'b2', icon: 'medkit-outline', title: 'Dentist appointment 10:00', priority: 'medium' },
        ],
        [at(3)]: [{ id: 'c1', icon: 'gift-outline', title: "Buy a friend's birthday gift", priority: 'medium' }],
        [at(-2)]: [{ id: 'd1', icon: 'shirt-outline', title: 'Do the laundry', priority: 'low', done: true }],
    };
}
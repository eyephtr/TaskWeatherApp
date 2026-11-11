import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
    Tasks: { flip?: number; formOpen?: boolean } | undefined;
    Weather: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    Tabs: NavigatorScreenParams<TabParamList>;
    TaskDetail: { taskId: string };
    TaskForm: { taskId?: string; date?: string } | undefined; // kept for edit flow from TaskDetailScreen
};

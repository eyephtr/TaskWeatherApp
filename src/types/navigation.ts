import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
    Tasks: undefined;
    Weather: undefined;
};

export type RootStackParamList = {
    Tabs: NavigatorScreenParams<TabParamList>;
    TaskDetail: { taskId: string };
};
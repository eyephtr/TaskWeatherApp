import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
    Tasks: undefined;
    Agenda: undefined;
    Weather: undefined;
    Settings: undefined;
};

export type RootStackParamList = {
    Tabs: NavigatorScreenParams<TabParamList>;
    TaskDetail: { taskId: string };
};
import React from 'react';
import {
    createBottomTabNavigator,
    type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import type { RootStackParamList, TabParamList } from '../types/navigation';

import FloatingTabBar from '../components/common/FloatingTabBar';

import TaskListScreen from '../screens/TaskListScreen';
import WeatherScreen from '../screens/WeatherScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import TaskFormScreen from '../screens/TaskFormScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

interface TabIconProps {
    focused: boolean;
    color: string;
    size: number;
}

const TasksIcon = ({ focused, color, size }: TabIconProps) => (
    <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} />
);
const WeatherIcon = ({ focused, color, size }: TabIconProps) => (
    <Ionicons name={focused ? 'partly-sunny' : 'partly-sunny-outline'} size={size} color={color} />
);
const SettingsIcon = ({ focused, color, size }: TabIconProps) => (
    <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
);

const renderTabBar = (props: BottomTabBarProps) => <FloatingTabBar {...props} />;

function Tabs() {
    return (
        <Tab.Navigator tabBar={renderTabBar}>
            <Tab.Screen
                name="Tasks"
                component={TaskListScreen}
                options={{ headerShown: false, title: 'Tasks', tabBarIcon: TasksIcon }}
            />
            <Tab.Screen
                name="Weather"
                component={WeatherScreen}
                options={{ headerShown: false, title: 'Weather', tabBarIcon: WeatherIcon }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false, title: 'Settings', tabBarIcon: SettingsIcon }}
            />
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Tabs"
                component={Tabs}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="TaskDetail"
                component={TaskDetailScreen}
                options={{ headerShown: false }}
            />

            {/* TaskForm kept for edit flow from TaskDetailScreen */}
            <Stack.Screen
                name="TaskForm"
                component={TaskFormScreen}
                options={{
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    );
}
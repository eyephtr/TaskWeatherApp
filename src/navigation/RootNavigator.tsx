import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TaskListScreen from '../screens/TaskListScreen';
import WeatherScreen from '../screens/WeatherScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import type { RootStackParamList, TabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Tasks"
                component={TaskListScreen}
                options={{ title: 'งานของฉัน', tabBarIcon: () => <Text>📝</Text> }}
            />
            <Tab.Screen
                name="Weather"
                component={WeatherScreen}
                options={{ title: 'สภาพอากาศ', tabBarIcon: () => <Text>⛅</Text> }}
            />
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
                name="TaskDetail"
                component={TaskDetailScreen}
                options={{ title: 'รายละเอียด' }}
            />
        </Stack.Navigator>
    );
}
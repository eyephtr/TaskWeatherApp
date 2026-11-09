import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({ route }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Task Detail</Text>
            <Text>id: {route.params.taskId}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    title: { fontSize: 22, fontWeight: '600' },
});
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

export default function TaskListScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Task List</Text>
            <Button
                title="เปิดรายละเอียด (ตัวอย่าง)"
                onPress={() => navigation.navigate('TaskDetail', { taskId: 'demo' })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    title: { fontSize: 22, fontWeight: '600' },
});
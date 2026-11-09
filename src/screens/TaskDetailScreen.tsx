import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({ route }: Props) {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Task Detail</Text>
            <Text style={{ color: colors.textMuted }}>id: {route.params.taskId}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
    title: { fontSize: fontSize.title, fontWeight: '600' },
});
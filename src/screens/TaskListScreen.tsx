import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../theme/tokens';

export default function TaskListScreen() {
    const { colors } = useTheme();
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View
                style={[
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <Text style={[styles.title, { color: colors.text }]}>Task List</Text>
                <Text style={{ color: colors.textMuted }}>หน้าตัวอย่างสำหรับทดสอบธีม</Text>
            </View>

            <Pressable
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('TaskDetail', { taskId: 'demo' })}>
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                    เปิดรายละเอียด (ตัวอย่าง)
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.lg,
        padding: spacing.lg,
    },
    card: {
        alignSelf: 'stretch',
        padding: spacing.lg,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.xs,
    },
    title: { fontSize: fontSize.title, fontWeight: '600' },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: radius.pill,
    },
    buttonText: { fontSize: fontSize.body, fontWeight: '600' },
});
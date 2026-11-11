import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import type { Task } from '../../types/task';

import { useTheme } from '../../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../../theme/tokens';
import { PRIORITY_COLOR } from '../../theme/priority';

import Check from './Check';

import { isOverdue } from '../../utils/taskStatus';

const INK = palette.bistre;
const INK_MUTED = '#7A6657'; // derived
const OVERDUE_INK = '#B5402B'; // derived
const CHIP_BG = `${palette.white}99`;

interface Props {
    task: Task;
    done: boolean;
    onToggle: () => void;
    onToggleSubtask: (subtaskId: string) => void;
    onPress: () => void;
}

export default function AgendaItem({ task, done, onToggle, onToggleSubtask, onPress }: Props) {
    const { colors } = useTheme();
    const time = task.start.replace(/^0/, ''); // 07:00 -> 7:00
    const range = task.end ? `${task.start} - ${task.end}` : null;
    const overdue = isOverdue(task);

    return (
        <View style={styles.row}>
            <Text style={[styles.time, { color: colors.textMuted }]}>{time}</Text>

            <Pressable
                accessibilityRole="button"
                onPress={onPress}
                style={[styles.card, { backgroundColor: PRIORITY_COLOR[task.priority] }]}>
                <View style={styles.top}>
                    <Text
                        numberOfLines={2}
                        style={[styles.title, done && styles.titleDone]}>
                        {task.title}
                    </Text>
                    <View style={styles.chip}>
                        <Text style={styles.chipText}>{task.tag}</Text>
                    </View>
                    <Check checked={done} onPress={onToggle} label={`Complete ${task.title}`} />
                </View>

                {range ? <Text style={styles.range}>{range}</Text> : null}
                {overdue ? (
                    <View style={styles.overdue}>
                        <Ionicons name="alert-circle" size={14} color={OVERDUE_INK} />
                        <Text style={styles.overdueText}>Overdue</Text>
                    </View>
                ) : null}

                {task.subtasks?.map(s => (
                    <View key={s.id} style={styles.subtask}>
                        <Check checked={s.done} onPress={() => onToggleSubtask(s.id)} label={s.title} size={22} />
                        <Text style={[styles.subtaskText, s.done && styles.titleDone]}>{s.title}</Text>
                    </View>
                ))}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    time: { width: 40, paddingTop: spacing.md, fontSize: fontSize.caption + 1 },
    card: {
        flex: 1,
        borderRadius: 24,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.xs,
    },
    top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { flex: 1, fontSize: fontSize.body, fontWeight: '700', color: INK },
    titleDone: { textDecorationLine: 'line-through', color: INK_MUTED },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: CHIP_BG,
    },
    chipText: { fontSize: fontSize.caption, color: INK_MUTED },
    range: { fontSize: fontSize.caption + 1, color: INK_MUTED },
    subtask: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
    subtaskText: { flex: 1, fontSize: fontSize.body - 2, color: INK },
    overdue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    overdueText: { fontSize: fontSize.caption + 1, fontWeight: '600', color: OVERDUE_INK },
});
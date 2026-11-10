import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';
import type { MockPriority, MockTask } from '../mock/mockTasks';

const CARD_COLOR: Record<MockPriority, string> = {
    high: palette.petalPink,
    medium: palette.peachPuff,
    low: palette.subtlePurple,
};

const INK = palette.bistre;
const INK_MUTED = '#7A6657'; // derived
const CHIP_BG = `${palette.white}99`;

interface CheckProps {
    checked: boolean;
    onPress: () => void;
    label: string;
    size?: number;
}

function Check({ checked, onPress, label, size = 28 }: CheckProps) {
    const { colors } = useTheme();
    return (
        <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={label}
            hitSlop={8}
            onPress={onPress}
            style={[
                styles.check,
                { width: size, height: size, borderRadius: size / 2 },
                checked
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: palette.white, borderColor: palette.white },
            ]}>
            {checked ? (
                <Ionicons name="checkmark" size={size * 0.6} color={palette.linenCream} />
            ) : null}
        </Pressable>
    );
}

interface Props {
    task: MockTask;
    done: boolean;
    onToggle: () => void;
    onPress: () => void;
}

export default function AgendaItem({ task, done, onToggle, onPress }: Props) {
    const { colors } = useTheme();
    const time = task.start.replace(/^0/, ''); // 07:00 -> 7:00
    const range = task.end ? `${task.start} - ${task.end}` : null;

    return (
        <View style={styles.row}>
            <Text style={[styles.time, { color: colors.textMuted }]}>{time}</Text>

            <Pressable
                accessibilityRole="button"
                onPress={onPress}
                style={[styles.card, { backgroundColor: CARD_COLOR[task.priority] }]}>
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

                {task.subtasks?.map(s => (
                    <View key={s.id} style={styles.subtask}>
                        <Check checked={!!s.done} onPress={() => { }} label={s.title} size={22} />
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
    check: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    range: { fontSize: fontSize.caption + 1, color: INK_MUTED },
    subtask: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
    subtaskText: { flex: 1, fontSize: fontSize.body - 2, color: INK },
});
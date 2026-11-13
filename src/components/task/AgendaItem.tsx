import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import type { Task } from '../../types/task';

import { useTheme } from '../../theme/ThemeProvider';
import { palette, fontSize, radius, spacing, TASK_COLORS } from '../../theme/tokens';
import { PRIORITY_COLOR, PRIORITY_LABEL, FLAG_COLOR } from '../../theme/priority';

import Check from './Check';

import { isOverdue } from '../../utils/taskStatus';
import type { WeatherWarning } from '../../utils/weatherWarning';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
    task: Task;
    done: boolean;
    warning?: WeatherWarning | null;
    onToggle: () => void;
    onToggleSubtask: (subtaskId: string) => void;
    onDelete: () => void;
    onPress: () => void;
    timeMode?: 'show' | 'blank' | 'hide';
}

function SwipeAction({
    icon,
    label,
    background,
    foreground,
    onPress,
}: {
    icon: IconName;
    label: string;
    background: string;
    foreground: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={[styles.action, { backgroundColor: background }]}>
            <Ionicons name={icon} size={22} color={foreground} />
            <Text style={[styles.actionText, { color: foreground }]}>{label}</Text>
        </Pressable>
    );
}

export default function AgendaItem({
    task,
    done,
    warning,
    onToggle,
    onToggleSubtask,
    onDelete,
    onPress,
    timeMode = 'show',
}: Props) {
    const { colors } = useTheme();
    const time = task.start.replace(/^0/, ''); // 07:00 -> 7:00
    const range = task.end ? `${task.start} - ${task.end}` : null;
    const overdue = isOverdue(task);
    const chipBg = palette.white + '66';

    return (
        <View style={styles.row}>
            {timeMode !== 'hide' ? (
                <Text style={[styles.time, { color: colors.textMuted }]}>{timeMode === 'show' ? time : ''}</Text>
            ) : null}

            <ReanimatedSwipeable
                containerStyle={styles.swipe}
                friction={2}
                leftThreshold={40}
                rightThreshold={40}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={(_progress, _translation, methods) => (
                    <View style={styles.leftActions}>
                        <SwipeAction
                            icon={done ? 'arrow-undo-outline' : 'checkmark'}
                            label={done ? 'Undo' : 'Done'}
                            background={colors.success}
                            foreground={colors.onSuccess}
                            onPress={() => {
                                methods.close();
                                onToggle();
                            }}
                        />
                    </View>
                )}
                renderRightActions={() => (
                    <View style={styles.rightActions}>
                        <SwipeAction
                            icon="trash-outline"
                            label="Delete"
                            background={colors.danger}
                            foreground={colors.onDanger}
                            onPress={onDelete}
                        />
                    </View>
                )}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityActions={[
                        { name: 'toggle', label: done ? 'Mark as not done' : 'Mark as done' },
                        { name: 'delete', label: 'Delete task' },
                    ]}
                    onAccessibilityAction={e => {
                        if (e.nativeEvent.actionName === 'toggle') {
                            onToggle();
                        } else if (e.nativeEvent.actionName === 'delete') {
                            onDelete();
                        }
                    }}
                    onPress={onPress}
                    style={[
                        styles.card,
                        {
                            backgroundColor: task.color
                                ? TASK_COLORS[task.color]
                                : task.priority !== 'none'
                                    ? PRIORITY_COLOR[task.priority]
                                    : palette.subtlePurple,
                        },
                    ]}>
                    <View style={styles.top}>
                        <View style={styles.titleWrap}>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.title,
                                    { color: colors.agendaInk },
                                    done && [styles.strike, { color: colors.agendaInkMuted }],
                                ]}>
                                {task.title}
                            </Text>
                            {task.priority !== 'none' ? (
                                <Ionicons
                                    name="flag"
                                    size={16}
                                    color={FLAG_COLOR[task.priority]}
                                    accessibilityLabel={`${PRIORITY_LABEL[task.priority]} priority`}
                                />
                            ) : null}
                        </View>
                        <View style={[styles.chip, { backgroundColor: chipBg }]}>
                            <Text style={[styles.chipText, { color: colors.agendaInkMuted }]}>{task.tag}</Text>
                        </View>
                        <Check checked={done} onPress={onToggle} label={`Complete ${task.title}`} />
                    </View>

                    {range ? <Text style={[styles.range, { color: colors.agendaInkMuted }]}>{range}</Text> : null}

                    {overdue ? (
                        <View style={styles.overdue}>
                            <Ionicons name="alert-circle" size={14} color={colors.agendaOverdue} />
                            <Text style={[styles.overdueText, { color: colors.agendaOverdue }]}>Overdue</Text>
                        </View>
                    ) : null}

                    {warning ? (
                        <View style={styles.warning}>
                            <Ionicons
                                name={warning.kind === 'rain' ? 'rainy-outline' : 'thermometer-outline'}
                                size={14}
                                color={colors.agendaInk}
                            />
                            <Text style={[styles.warningText, { color: colors.agendaInk }]}>{warning.label}</Text>
                        </View>
                    ) : null}

                    {task.subtasks?.map(s => (
                        <View key={s.id} style={styles.subtask}>
                            <Check checked={s.done} onPress={() => onToggleSubtask(s.id)} label={s.title} size={22} />
                            <Text
                                style={[
                                    styles.subtaskText,
                                    { color: colors.agendaInk },
                                    s.done && [styles.strike, { color: colors.agendaInkMuted }],
                                ]}>
                                {s.title}
                            </Text>
                        </View>
                    ))}
                </Pressable>
            </ReanimatedSwipeable>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    time: { width: 40, paddingTop: spacing.md, fontSize: fontSize.caption + 1 },
    swipe: { flex: 1 },
    card: {
        borderRadius: 24,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.xs,
    },
    top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { flexShrink: 1, fontSize: fontSize.body, fontWeight: '700' },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
    },
    chipText: { fontSize: fontSize.caption },
    strike: { textDecorationLine: 'line-through' },
    range: { fontSize: fontSize.caption + 1 },
    titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    subtask: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
    subtaskText: { flex: 1, fontSize: fontSize.body - 2 },
    overdue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    overdueText: { fontSize: fontSize.caption + 1, fontWeight: '600' },
    warning: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    warningText: { fontSize: fontSize.caption + 1, fontWeight: '600' },
    leftActions: { flexDirection: 'row', paddingRight: spacing.sm },
    rightActions: { flexDirection: 'row', paddingLeft: spacing.sm },
    action: {
        width: 84,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        borderRadius: 24,
    },
    actionText: { fontSize: fontSize.caption + 1, fontWeight: '700' },
});
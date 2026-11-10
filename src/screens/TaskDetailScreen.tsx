import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import type { Task } from '../types/task';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';
import { PRIORITY_COLOR, PRIORITY_LABEL } from '../theme/priority';
import { useTaskStore } from '../store/useTaskStore';
import { formatDate } from '../utils/date';
import Check from '../components/Check';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const INK = palette.bistre;
const INK_MUTED = '#7A6657'; // derived
const CHIP_BG = `${palette.white}99`;

function Badge({ text, icon }: { text: string; icon?: IconName }) {
    return (
        <View style={styles.badge}>
            {icon ? <Ionicons name={icon} size={14} color={INK_MUTED} /> : null}
            <Text style={styles.badgeText}>{text}</Text>
        </View>
    );
}

function InfoRow({
    icon,
    label,
    value,
    last,
}: {
    icon: IconName;
    label: string;
    value: string;
    last?: boolean;
}) {
    const { colors } = useTheme();
    return (
        <View
            style={[
                styles.infoRow,
                !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}>
            <Ionicons name={icon} size={20} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

export default function TaskDetailScreen({ navigation, route }: Props) {
    const { colors } = useTheme();
    const { taskId } = route.params;

    const liveTask = useTaskStore(s => s.tasks.find(t => t.id === taskId));
    const toggleDone = useTaskStore(s => s.toggleDone);
    const toggleSubtask = useTaskStore(s => s.toggleSubtask);
    const deleteTask = useTaskStore(s => s.deleteTask);

    // เก็บสำเนาไว้ตอนลบ เพื่อไม่ให้หน้าเปลี่ยนเป็น "not found" วูบหนึ่งระหว่างอนิเมชันย้อนกลับ
    const [deleted, setDeleted] = useState<Task | null>(null);
    const task = liveTask ?? deleted;

    if (!task) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={[styles.notFound, { color: colors.text }]}>This task no longer exists.</Text>
                <Pressable onPress={navigation.goBack} accessibilityRole="button">
                    <Text style={{ color: colors.primary, fontSize: fontSize.body }}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    const time = task.end ? `${task.start} - ${task.end}` : task.start;
    const doneSubtasks = task.subtasks.filter(s => s.done).length;

    const confirmDelete = () => {
        Alert.alert('Delete task?', `"${task.title}" will be removed permanently.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    setDeleted(task);
                    deleteTask(task.id);
                    navigation.goBack();
                },
            },
        ]);
    };

    return (
        <ScrollView
            style={[styles.root, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}>
            <View style={[styles.hero, { backgroundColor: PRIORITY_COLOR[task.priority] }]}>
                <View style={styles.heroTop}>
                    <Check
                        checked={task.done}
                        onPress={() => toggleDone(task.id)}
                        label={`Complete ${task.title}`}
                        size={32}
                    />
                    <Text style={[styles.title, task.done && styles.titleDone]}>{task.title}</Text>
                </View>
                <View style={styles.badges}>
                    <Badge text={task.tag} />
                    <Badge text={`${PRIORITY_LABEL[task.priority]} priority`} />
                    {task.outdoor ? <Badge text="Outdoor" icon="partly-sunny-outline" /> : null}
                </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <InfoRow icon="calendar-outline" label="Date" value={formatDate(task.date)} />
                <InfoRow icon="time-outline" label="Time" value={time} />
                <InfoRow
                    icon="checkmark-circle-outline"
                    label="Status"
                    value={task.done ? 'Completed' : 'Not completed'}
                    last
                />
            </View>

            {task.subtasks.length > 0 ? (
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Subtasks · {doneSubtasks}/{task.subtasks.length}
                    </Text>
                    {task.subtasks.map(s => (
                        <View key={s.id} style={styles.subtaskRow}>
                            <Check
                                checked={s.done}
                                onPress={() => toggleSubtask(task.id, s.id)}
                                label={s.title}
                                size={24}
                            />
                            <Text
                                style={[
                                    styles.subtaskText,
                                    { color: s.done ? colors.textMuted : colors.text },
                                    s.done && styles.titleDone,
                                ]}>
                                {s.title}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : null}

            <Pressable
                accessibilityRole="button"
                onPress={() => toggleDone(task.id)}
                style={[styles.button, { backgroundColor: colors.primary }]}>
                <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                    {task.done ? 'Mark as not done' : 'Mark as done'}
                </Text>
            </Pressable>

            <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
                style={[styles.button, styles.secondary, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Ionicons name="create-outline" size={20} color={colors.text} />
                <Text style={[styles.buttonText, { color: colors.text }]}>Edit task</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                <Text style={[styles.deleteText, { color: colors.danger }]}>Delete task</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.md },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    notFound: { fontSize: fontSize.body },
    hero: { borderRadius: 24, padding: spacing.lg, gap: spacing.md },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    title: { flex: 1, fontSize: fontSize.title, fontWeight: '700', color: INK },
    titleDone: { textDecorationLine: 'line-through' },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: CHIP_BG,
    },
    badgeText: { fontSize: fontSize.caption, color: INK_MUTED },
    card: { borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
    },
    infoLabel: { fontSize: fontSize.body, width: 64 },
    infoValue: { flex: 1, fontSize: fontSize.body, fontWeight: '500', textAlign: 'right' },
    sectionTitle: { fontSize: fontSize.body, fontWeight: '700', paddingVertical: spacing.md },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingBottom: spacing.md,
    },
    subtaskText: { flex: 1, fontSize: fontSize.body },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        borderRadius: radius.pill,
    },
    secondary: { borderWidth: 1 },
    buttonText: { fontSize: fontSize.body, fontWeight: '700' },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
    },
    deleteText: { fontSize: fontSize.body, fontWeight: '600' },
});
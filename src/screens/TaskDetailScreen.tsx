import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import type { Task } from '../types/task';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';
import { PRIORITY_COLOR, PRIORITY_LABEL } from '../theme/priority';

import { useTaskStore } from '../store/useTaskStore';
import { useWeatherStore } from '../store/useWeatherStore';

import Check from '../components/task/Check';
import ScreenHeader, { HEADER_BUTTON_SIZE, HeaderButton } from '../components/common/ScreenHeader';
import StatusBanner from '../components/common/StatusBanner';

import { formatDate } from '../utils/date';
import { isOverdue } from '../utils/taskStatus';
import { getWeatherWarning } from '../utils/weatherWarning';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

function Divider() {
    const { colors } = useTheme();
    return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

function SectionTitle({ children, right }: { children: string; right?: string }) {
    const { colors } = useTheme();
    return (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>
            {right ? <Text style={[styles.sectionRight, { color: colors.textMuted }]}>{right}</Text> : null}
        </View>
    );
}

function Pill({ text, icon, style }: { text: string; icon?: IconName; style?: object }) {
    const { colors } = useTheme();
    return (
        <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
            {icon ? <Ionicons name={icon} size={20} color={colors.text} /> : null}
            <Text style={[styles.pillText, { color: colors.text }]}>{text}</Text>
        </View>
    );
}

function Chip({ text, bg, fg, icon }: { text: string; bg: string; fg: string; icon?: IconName }) {
    return (
        <View style={[styles.chip, { backgroundColor: bg }]}>
            {icon ? <Ionicons name={icon} size={14} color={fg} /> : null}
            <Text style={[styles.chipText, { color: fg }]}>{text}</Text>
        </View>
    );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
    const { colors } = useTheme();
    return (
        <View style={styles.propRow}>
            <Text style={[styles.propLabel, { color: colors.text }]}>{label}</Text>
            <View style={styles.propValue}>{children}</View>
        </View>
    );
}

function AddSubtaskRow({ onAdd, bordered }: { onAdd: (title: string) => void; bordered?: boolean }) {
    const { colors } = useTheme();
    const [text, setText] = useState('');

    const submit = () => {
        const value = text.trim();
        if (!value) {
            return;
        }
        onAdd(value);
        setText('');
    };

    return (
        <View
            style={[
                styles.addRow,
                bordered && [
                    styles.subtaskRow,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                ],
            ]}>
            <View style={[styles.squareBox, { borderColor: colors.textMuted }]} />
            <TextInput
                accessibilityLabel="Add subtask"
                value={text}
                onChangeText={setText}
                onSubmitEditing={submit}
                blurOnSubmit={false}
                returnKeyType="done"
                placeholder="Add subtask"
                placeholderTextColor={colors.textMuted}
                style={[styles.addInput, { color: colors.text }]}
            />
        </View>
    );
}

export default function TaskDetailScreen({ navigation, route }: Props) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { taskId } = route.params;
    const background = isDark ? palette.bistre : palette.linenCream;

    const liveTask = useTaskStore(s => s.tasks.find(t => t.id === taskId));
    const toggleDone = useTaskStore(s => s.toggleDone);
    const toggleSubtask = useTaskStore(s => s.toggleSubtask);
    const updateTask = useTaskStore(s => s.updateTask);
    const deleteTask = useTaskStore(s => s.deleteTask);

    const [deleted, setDeleted] = useState<Task | null>(null);
    const task = liveTask ?? deleted;

    const [menuOpen, setMenuOpen] = useState(false);

    const forecast = useWeatherStore(s => s.data?.daily);

    if (!task) {
        return (
            <View style={[styles.center, { backgroundColor: background }]}>
                <Text style={[styles.notFound, { color: colors.text }]}>This task no longer exists.</Text>
                <Pressable onPress={navigation.goBack} accessibilityRole="button">
                    <Text style={{ color: colors.primary, fontSize: fontSize.body }}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    const overdue = isOverdue(task);
    const warning = getWeatherWarning(task, forecast);
    const status = task.done
        ? { text: 'Completed', bg: colors.success, fg: colors.onSuccess }
        : overdue
            ? { text: 'Overdue', bg: colors.danger, fg: colors.onDanger }
            : { text: 'To do', bg: colors.weatherCard, fg: colors.onWeatherCard };
    const doneSubtasks = task.subtasks.filter(s => s.done).length;
    const menuTop = Math.max(insets.top, spacing.md) + spacing.sm + HEADER_BUTTON_SIZE + spacing.sm;

    const saveSubtasks = (subtasks: { id?: string; title: string; done: boolean }[]) => {
        updateTask(task.id, {
            title: task.title,
            date: task.date,
            start: task.start,
            end: task.end,
            tag: task.tag,
            priority: task.priority,
            outdoor: task.outdoor,
            subtasks,
        });
    };

    const currentSubtasks = () =>
        task.subtasks.map(s => ({ id: s.id, title: s.title, done: s.done }));

    const addSubtask = (title: string) => saveSubtasks([...currentSubtasks(), { title, done: false }]);

    const removeSubtask = (subtaskId: string) =>
        saveSubtasks(currentSubtasks().filter(s => s.id !== subtaskId));

    const closeMenu = () => setMenuOpen(false);

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
        <View style={[styles.root, { backgroundColor: background }]}>
            <ScreenHeader
                right={<HeaderButton icon="ellipsis-horizontal" label="More actions" onPress={() => setMenuOpen(true)} />}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets>
                <Text style={[styles.tagLabel, { color: colors.primary }]}>{task.tag}</Text>
                <View style={styles.titleRow}>
                    {warning ? (
                        <View style={styles.warning}>
                            <StatusBanner title={warning.label} message={warning.message} />
                        </View>
                    ) : null}
                    <Text style={[styles.title, { color: colors.text }, task.done && styles.titleDone]}>
                        {task.title}
                    </Text>
                    <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: task.done }}
                        accessibilityLabel={`Complete ${task.title}`}
                        hitSlop={8}
                        onPress={() => toggleDone(task.id)}
                        style={[
                            styles.doneCircle,
                            task.done
                                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                : { borderColor: colors.text },
                        ]}>
                        {task.done ? <Ionicons name="checkmark" size={20} color={palette.linenCream} /> : null}
                    </Pressable>
                </View>

                <Divider />

                <SectionTitle>Date & Time</SectionTitle>
                <Pill icon="calendar-outline" text={formatDate(task.date)} />
                <View style={styles.timeRow}>
                    <Pill text={task.start} style={styles.timePill} />
                    {task.end ? <Pill text={task.end} style={styles.timePill} /> : null}
                </View>

                <Divider />

                <PropertyRow label="Status">
                    <Chip text={status.text} bg={status.bg} fg={status.fg} />
                </PropertyRow>
                <PropertyRow label="Priority">
                    <Chip
                        text={PRIORITY_LABEL[task.priority]}
                        bg={PRIORITY_COLOR[task.priority]}
                        fg={palette.bistre}
                    />
                </PropertyRow>
                <PropertyRow label="Tags">
                    <Chip text={task.tag} bg={palette.subtlePurple} fg={colors.text} />
                    {task.outdoor ? (
                        <Chip text="Outdoor" bg={colors.success} fg={colors.onSuccess} icon="partly-sunny-outline" />
                    ) : null}
                </PropertyRow>

                {task.subtasks.length > 0 ? (
                    <>
                        <Divider />
                        <SectionTitle right={`${doneSubtasks}/${task.subtasks.length}`}>Subtasks</SectionTitle>
                        <View style={styles.subtasks}>
                            {task.subtasks.map(s => (
                                <View
                                    key={s.id}
                                    style={[
                                        styles.subtaskRow,
                                        { backgroundColor: colors.surface, borderColor: colors.border },
                                    ]}>
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
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={`Remove ${s.title}`}
                                        hitSlop={8}
                                        onPress={() => removeSubtask(s.id)}>
                                        <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                                    </Pressable>
                                </View>
                            ))}
                            <AddSubtaskRow bordered onAdd={addSubtask} />
                        </View>
                    </>
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                        <AddSubtaskRow onAdd={addSubtask} />
                    </View>
                )}

                <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    <Text style={[styles.deleteText, { color: colors.danger }]}>Delete task</Text>
                </Pressable>
            </ScrollView>

            <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={closeMenu}>
                <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu}>
                    <View
                        style={[
                            styles.menu,
                            { top: menuTop, backgroundColor: colors.surface, borderColor: colors.border },
                        ]}>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                                closeMenu();
                                toggleDone(task.id);
                            }}
                            style={styles.menuItem}>
                            <Ionicons
                                name={task.done ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                                size={20}
                                color={colors.text}
                            />
                            <Text style={[styles.menuText, { color: colors.text }]}>
                                {task.done ? 'Mark as not done' : 'Mark as done'}
                            </Text>
                        </Pressable>
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                                closeMenu();
                                navigation.navigate('TaskForm', { taskId: task.id });
                            }}
                            style={styles.menuItem}>
                            <Ionicons name="create-outline" size={20} color={colors.text} />
                            <Text style={[styles.menuText, { color: colors.text }]}>Edit task</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl * 2,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    notFound: { fontSize: fontSize.body },

    tagLabel: { fontSize: fontSize.body, fontWeight: '600' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
    title: { flex: 1, fontSize: fontSize.display - 4, fontWeight: '700' },
    titleDone: { textDecorationLine: 'line-through' },
    doneCircle: {
        width: 32,
        height: 32,
        borderRadius: radius.pill,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.lg },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: { fontSize: fontSize.body, fontWeight: '700' },
    sectionRight: { fontSize: fontSize.body, fontWeight: '600' },

    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        minHeight: 52,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    pillText: { fontSize: fontSize.body, fontWeight: '600' },
    timeRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    timePill: { flex: 1 },

    propRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        minHeight: 48,
    },
    propLabel: { fontSize: fontSize.body },
    propValue: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: spacing.sm },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md + 2,
        paddingVertical: spacing.sm - 1,
        borderRadius: radius.pill,
    },
    chipText: { fontSize: fontSize.body - 2, fontWeight: '600' },

    subtasks: { gap: spacing.sm },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 52,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    subtaskText: { flex: 1, fontSize: fontSize.body },

    addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    squareBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2 },
    addInput: { flex: 1, fontSize: fontSize.body, paddingVertical: spacing.md },

    emptyCard: {
        marginTop: spacing.lg,
        borderRadius: radius.lg + 8,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing.md,
    },

    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        marginTop: spacing.xl,
    },
    deleteText: { fontSize: fontSize.body, fontWeight: '600' },

    menu: {
        position: 'absolute',
        right: spacing.lg,
        minWidth: 210,
        borderRadius: radius.lg,
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: palette.bistre,
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 48,
        paddingHorizontal: spacing.lg,
    },
    menuText: { fontSize: fontSize.body, fontWeight: '500' },
    menuDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.md },
    warning: { marginTop: spacing.lg },
});
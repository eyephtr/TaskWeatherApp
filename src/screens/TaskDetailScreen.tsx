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

function Rings() {
    const { colors } = useTheme();
    return (
        <View style={styles.rings} pointerEvents="none">
            {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={[styles.ring, { backgroundColor: colors.ring }]} />
            ))}
        </View>
    );
}

function SectionTitle({ children, right }: { children: string; right?: string }) {
    const { colors } = useTheme();
    return (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{children}</Text>
            {right ? <Text style={[styles.sectionRight, { color: colors.textMuted }]}>{right}</Text> : null}
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

function AddSubtaskRow({ onAdd }: { onAdd: (title: string) => void }) {
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
        <View style={[styles.addRow, { backgroundColor: colors.field }]}>
            <Ionicons name="add" size={20} color={colors.textMuted} style={styles.addIcon} />
            <TextInput
                accessibilityLabel="Add subtask"
                value={text}
                onChangeText={setText}
                onSubmitEditing={submit}
                blurOnSubmit={false}
                returnKeyType="done"
                placeholder="Add a subtask..."
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
    const background = isDark ? colors.background : palette.linenCream;

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
            color: task.color,
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

                {/* Hero Card */}
                <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Rings />

                    <View style={styles.heroTopRow}>
                        <View style={[styles.tagBadge, { backgroundColor: colors.field }]}>
                            <Text style={[styles.tagLabel, { color: colors.primary }]}>{task.tag || 'General'}</Text>
                        </View>
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
                                    : { borderColor: colors.textMuted },
                            ]}>
                            {task.done ? <Ionicons name="checkmark" size={18} color={palette.linenCream} /> : null}
                        </Pressable>
                    </View>

                    <Text style={[styles.title, { color: colors.text }, task.done && styles.titleDone]}>
                        {task.title}
                    </Text>

                    <View style={styles.badgeRow}>
                        <Chip text={status.text} bg={status.bg} fg={status.fg} />
                        <Chip
                            text={PRIORITY_LABEL[task.priority]}
                            bg={PRIORITY_COLOR[task.priority]}
                            fg={palette.bistre}
                        />
                        {task.outdoor ? (
                            <Chip text="Outdoor" bg={colors.success} fg={colors.onSuccess} icon="partly-sunny-outline" />
                        ) : null}
                    </View>
                </View>

                {warning ? (
                    <View style={styles.warningContainer}>
                        <StatusBanner title={warning.label} message={warning.message} />
                    </View>
                ) : null}

                <SectionTitle>SCHEDULE</SectionTitle>
                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconBox, { backgroundColor: colors.field }]}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.infoTexts}>
                            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Date</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(task.date)}</Text>
                        </View>
                    </View>

                    <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconBox, { backgroundColor: colors.field }]}>
                            <Ionicons name="time-outline" size={20} color={colors.primary} />
                        </View>
                        <View style={styles.infoTexts}>
                            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Time</Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {task.start} {task.end ? `- ${task.end}` : ''}
                            </Text>
                        </View>
                    </View>
                </View>

                <SectionTitle right={task.subtasks.length > 0 ? `${doneSubtasks}/${task.subtasks.length}` : undefined}>
                    SUBTASKS
                </SectionTitle>
                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {task.subtasks.length > 0 ? (
                        <View style={styles.subtasksList}>
                            {task.subtasks.map((s, index) => (
                                <React.Fragment key={s.id}>
                                    {index > 0 ? <View style={[styles.innerDivider, { backgroundColor: colors.border }]} /> : null}
                                    <View style={styles.subtaskRow}>
                                        <Check
                                            checked={s.done}
                                            onPress={() => toggleSubtask(task.id, s.id)}
                                            label={s.title}
                                            size={22}
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
                                            <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                                        </Pressable>
                                    </View>
                                </React.Fragment>
                            ))}
                            <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />
                        </View>
                    ) : null}
                    <AddSubtaskRow onAdd={addSubtask} />
                </View>

                <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
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

    heroCard: {
        marginTop: spacing.sm,
        borderRadius: radius.lg,
        paddingTop: spacing.xl + spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        borderWidth: StyleSheet.hairlineWidth,
        gap: spacing.md,
        shadowColor: palette.bistre,
        shadowOpacity: 0.14,
        shadowRadius: 8,
        shadowOffset: { width: 2, height: 4 },
        elevation: 5,
    },
    rings: {
        position: 'absolute',
        top: -10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl + spacing.md,
    },
    ring: {
        width: 15,
        height: 30,
        borderRadius: 6,
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tagBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
    },
    tagLabel: { fontSize: fontSize.caption + 1, fontWeight: '700' },

    title: { 
        fontSize: fontSize.display - 6, 
        fontWeight: '700', 
        lineHeight: 32, 
        textAlign: 'center', // จัดชื่องานให้อยู่กึ่งกลาง
        marginVertical: spacing.sm 
    },
    titleDone: { textDecorationLine: 'line-through', opacity: 0.6 },

    doneCircle: {
        width: 30,
        height: 30,
        borderRadius: radius.pill,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', // จัดกลุ่มแท็กให้อยู่กึ่งกลางใต้ชื่อ
        gap: spacing.sm,
        marginTop: spacing.xs,
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.xl,
        marginBottom: spacing.xs,
        paddingHorizontal: spacing.xs,
    },
    sectionTitle: { fontSize: fontSize.caption, fontWeight: '700', letterSpacing: 0.5 },
    sectionRight: { fontSize: fontSize.caption, fontWeight: '600' },

    infoCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    infoIconBox: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoTexts: { flex: 1, gap: 2 },
    infoLabel: { fontSize: fontSize.caption },
    infoValue: { fontSize: fontSize.body, fontWeight: '600' },
    innerDivider: { height: StyleSheet.hairlineWidth, width: '100%' },

    subtasksList: {
        width: '100%',
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    subtaskText: { flex: 1, fontSize: fontSize.body },

    addRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        minHeight: 50,
    },
    addIcon: { marginRight: spacing.sm },
    addInput: { flex: 1, fontSize: fontSize.body },

    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
    },
    chipText: { fontSize: fontSize.caption + 1, fontWeight: '600' },

    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        marginTop: spacing.xl * 1.5,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: 'transparent',
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
    warningContainer: { marginTop: spacing.lg },
});
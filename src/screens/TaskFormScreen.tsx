import React, { useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
    type LayoutChangeEvent,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import type { Priority, SubtaskInput, TaskInput, ValidationErrors } from '../types/task';

import { useTheme } from '../theme/ThemeProvider';
import { PRIORITIES, PRIORITY_COLOR, PRIORITY_LABEL } from '../theme/priority';
import { DEFAULT_TASK_COLOR, fontSize, palette, radius, spacing, type TaskColorKey } from '../theme/tokens';

import { useTaskStore } from '../store/useTaskStore';

import ScreenHeader from '../components/common/ScreenHeader';
import ColorPicker from '../components/task/ColorPicker';
import TimeRangeRow from '../components/task/TimeRangeRow';

import { fromDateString, toDateString } from '../utils/date';

import { TAG_MAX, TITLE_MAX, validateTaskInput } from '../utils/taskValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;
type ScrollViewRef = React.ComponentRef<typeof ScrollView>;

function Field({
    label,
    error,
    children,
    onLayout,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
    onLayout?: (event: LayoutChangeEvent) => void;
}) {
    const { colors } = useTheme();
    return (
        <View style={styles.field} onLayout={onLayout}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
            {children}
            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        </View>
    );
}

function Divider() {
    const { colors } = useTheme();
    return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

export default function TaskFormScreen({ navigation, route }: Props) {
    const { colors, isDark } = useTheme();
    const taskId = route.params?.taskId;
    const existing = useTaskStore(s => s.tasks.find(t => t.id === taskId));
    const addTask = useTaskStore(s => s.addTask);
    const updateTask = useTaskStore(s => s.updateTask);

    const [title, setTitle] = useState(existing?.title ?? '');
    const [tag, setTag] = useState(existing?.tag ?? '');
    const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'none');
    const [color, setColor] = useState<TaskColorKey>(existing?.color ?? DEFAULT_TASK_COLOR);
    const [date, setDate] = useState(
        existing?.date ?? route.params?.date ?? toDateString(new Date()),
    );
    const [start, setStart] = useState(existing?.start ?? '09:00');
    const [end, setEnd] = useState<string | null>(existing?.end ?? null);
    const [outdoor, setOutdoor] = useState(existing?.outdoor ?? false);
    const [subtasks, setSubtasks] = useState<SubtaskInput[]>(
        existing?.subtasks.map(s => ({ id: s.id, title: s.title, done: s.done })) ?? [],
    );
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState<ValidationErrors>({});

    const savedRef = useRef(false);
    const scrollViewRef = useRef<ScrollViewRef>(null);
    const fieldOffsets = useRef<Record<string, number>>({});

    if (taskId && !existing) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={[styles.notFound, { color: colors.text }]}>This task no longer exists.</Text>
                <Pressable onPress={navigation.goBack} accessibilityRole="button">
                    <Text style={{ color: colors.primary }}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    const clearError = (key: keyof ValidationErrors) =>
        setErrors(prev => ({ ...prev, [key]: undefined }));

    const addSubtask = () => {
        const text = newSubtask.trim();
        if (!text) {
            return;
        }
        setSubtasks(prev => [...prev, { title: text, done: false }]);
        setNewSubtask('');
    };

    const handleSave = () => {
        if (savedRef.current) {
            return;
        }
        const pending = newSubtask.trim();
        const input: TaskInput = {
            title,
            date,
            start,
            end: end ?? undefined,
            tag,
            priority,
            color,
            outdoor,
            subtasks: pending ? [...subtasks, { title: pending, done: false }] : subtasks,
        };

        const validationErrors = validateTaskInput(input);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);

            const firstErrorKey = Object.keys(validationErrors)[0];
            const lookupKey = firstErrorKey === 'start' || firstErrorKey === 'end' ? 'date' : firstErrorKey;
            const yOffset = fieldOffsets.current[lookupKey];
            if (yOffset !== undefined && scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: Math.max(0, yOffset - 20), animated: true });
            }
            return;
        }

        const result = taskId ? updateTask(taskId, input) : addTask(input);

        if (result && typeof result === 'object' && 'ok' in result) {
            if (result.ok) {
                savedRef.current = true;
                navigation.goBack();
                return;
            }
            if (result.notFound) {
                navigation.goBack();
                return;
            }
            if (result.errors) {
                setErrors(result.errors);
            }
            return;
        }

        savedRef.current = true;
        navigation.goBack();
    };

    const inputStyle = (hasError: boolean) => [
        styles.input,
        { backgroundColor: colors.field, color: colors.text },
        hasError && [styles.errorBorder, { borderColor: colors.danger }],
    ];

    const pickerTheme = isDark ? 'dark' : 'light';
    const hasTimeError = Boolean(errors.start || errors.end);

    return (
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
            <ScreenHeader variant="close" title={taskId ? 'Edit Task' : 'New Task'} />
            <ScrollView
                ref={scrollViewRef}
                style={[styles.root, { backgroundColor: colors.surface }]}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets>
                <Field
                    label="Title"
                    error={errors.title}
                    onLayout={e => {
                        fieldOffsets.current.title = e.nativeEvent.layout.y;
                    }}>
                    <TextInput
                        accessibilityLabel="Task title"
                        value={title}
                        onChangeText={t => {
                            setTitle(t);
                            clearError('title');
                        }}
                        placeholder="What needs to be done?"
                        placeholderTextColor={colors.textMuted}
                        maxLength={TITLE_MAX}
                        returnKeyType="done"
                        style={inputStyle(!!errors.title)}
                    />
                </Field>

                <Field label="Priority">
                    <View style={styles.chips}>
                        {PRIORITIES.map(p => {
                            const active = p === priority;
                            return (
                                <Pressable
                                    key={p}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                    onPress={() => setPriority(p)}
                                    style={[
                                        styles.chip,
                                        { backgroundColor: PRIORITY_COLOR[p] },
                                        active ? { borderColor: colors.text } : styles.chipInactive,
                                    ]}>
                                    <Text style={styles.chipText}>{PRIORITY_LABEL[p]}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Field>

                <Field label="Color">
                    <ColorPicker value={color} onChange={setColor} />
                </Field>

                <Field
                    label="Date & Time"
                    error={errors.date ?? errors.start ?? errors.end}
                    onLayout={e => {
                        fieldOffsets.current.date = e.nativeEvent.layout.y;
                    }}>
                    <View
                        style={[
                            styles.box,
                            { backgroundColor: colors.field },
                            errors.date && [styles.errorBorder, { borderColor: colors.danger }],
                        ]}>
                        <DateTimePicker
                            value={fromDateString(date)}
                            mode="date"
                            display="compact"
                            locale="en-GB"
                            themeVariant={pickerTheme}
                            onValueChange={(_, d) => {
                                setDate(toDateString(d));
                                clearError('date');
                            }}
                        />
                        <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                    </View>
                    <View
                        style={[
                            styles.timeWrapper,
                            hasTimeError && [styles.errorBorder, { borderColor: colors.danger }],
                        ]}>
                        <TimeRangeRow
                            start={start}
                            end={end}
                            onChangeStart={v => {
                                setStart(v);
                                clearError('start');
                            }}
                            onChangeEnd={v => {
                                setEnd(v);
                                clearError('end');
                            }}
                        />
                    </View>
                </Field>

                <Field
                    label="Tag"
                    error={errors.tag}
                    onLayout={e => {
                        fieldOffsets.current.tag = e.nativeEvent.layout.y;
                    }}>
                    <TextInput
                        accessibilityLabel="Task tag"
                        value={tag}
                        onChangeText={t => {
                            setTag(t);
                            clearError('tag');
                        }}
                        placeholder="General"
                        placeholderTextColor={colors.textMuted}
                        maxLength={TAG_MAX + 10}
                        style={inputStyle(!!errors.tag)}
                    />
                </Field>

                <Field label="Subtasks">
                    {subtasks.map((s, i) => (
                        <View
                            key={s.id ?? `new-${i}`}
                            style={[styles.subtaskItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.subtaskText, { color: colors.text }]}>{s.title}</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${s.title}`}
                                hitSlop={8}
                                onPress={() => setSubtasks(prev => prev.filter((_, idx) => idx !== i))}>
                                <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                            </Pressable>
                        </View>
                    ))}
                    <View style={styles.subtaskInputRow}>
                        <TextInput
                            accessibilityLabel="New subtask"
                            value={newSubtask}
                            onChangeText={setNewSubtask}
                            onSubmitEditing={addSubtask}
                            placeholder="Add a subtask"
                            placeholderTextColor={colors.textMuted}
                            returnKeyType="done"
                            style={[inputStyle(false), styles.subtaskInput]}
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Add subtask"
                            onPress={addSubtask}
                            style={[styles.addButton, { backgroundColor: colors.field }]}>
                            <Ionicons name="add" size={22} color={colors.text} />
                        </Pressable>
                    </View>
                </Field>

                <View style={[styles.switchRow, { backgroundColor: colors.field }]}>
                    <View style={styles.switchText}>
                        <Text style={[styles.pickerLabel, { color: colors.text }]}>Outdoor task</Text>
                        <Text style={[styles.hint, { color: colors.textMuted }]}>
                            Get a weather warning on this task
                        </Text>
                    </View>
                    <Switch
                        value={outdoor}
                        onValueChange={setOutdoor}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>

                <Divider />

                <Pressable
                    accessibilityRole="button"
                    onPress={handleSave}
                    style={[styles.save, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.saveText, { color: colors.onPrimary }]}>
                        {taskId ? 'Save changes' : 'Add task'}
                    </Text>
                </Pressable>

                <Pressable accessibilityRole="button" onPress={navigation.goBack} style={styles.cancel}>
                    <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    notFound: { fontSize: fontSize.body },
    field: { marginBottom: spacing.xl, gap: spacing.sm },
    label: { fontSize: fontSize.body - 1, fontWeight: '700' },
    error: { fontSize: fontSize.caption + 1 },
    errorBorder: { borderWidth: 1.5 },
    input: {
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: fontSize.body,
    },
    chips: { flexDirection: 'row', gap: spacing.sm },
    chip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    chipInactive: { opacity: 0.55 },
    chipText: { color: palette.bistre, fontWeight: '600', fontSize: fontSize.body - 2 },
    pickerLabel: { fontSize: fontSize.body },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.xl,
    },
    switchText: {
        flex: 1,
        paddingRight: spacing.md,
    },
    hint: { fontSize: fontSize.caption + 1, marginTop: 2 },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: spacing.lg,
    },
    timeWrapper: {
        borderRadius: radius.md,
    },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
    },
    subtaskText: { flex: 1, fontSize: fontSize.body },
    subtaskInputRow: { flexDirection: 'row', gap: spacing.sm },
    subtaskInput: { flex: 1 },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
        paddingLeft: spacing.xs,
        paddingRight: spacing.md,
        borderRadius: radius.md,
    },
    addButton: {
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.md,
    },
    save: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderRadius: radius.pill,
        marginTop: spacing.md,
    },
    saveText: { fontSize: fontSize.body, fontWeight: '700' },
    cancel: { alignItems: 'center', paddingVertical: spacing.lg },
    cancelText: { fontSize: fontSize.body },
});
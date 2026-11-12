import React, { useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import type { Priority, SubtaskInput, TaskInput, ValidationErrors } from '../types/task';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';
import { PRIORITIES, PRIORITY_COLOR, PRIORITY_LABEL } from '../theme/priority';

import { useTaskStore } from '../store/useTaskStore';

import ScreenHeader from '../components/common/ScreenHeader';

import { addMinutes, fromDateString, fromTimeString, toDateString, toTimeString } from '../utils/date';
import { TAG_MAX, TITLE_MAX } from '../utils/taskValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    const { colors } = useTheme();
    return (
        <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
            {children}
            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        </View>
    );
}

function PickerRow({ label, children }: { label: string; children: React.ReactNode }) {
    const { colors } = useTheme();
    return (
        <View style={[styles.pickerRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.pickerLabel, { color: colors.text }]}>{label}</Text>
            {children}
        </View>
    );
}

export default function TaskFormScreen({ navigation, route }: Props) {
    const { colors, isDark } = useTheme();
    const taskId = route.params?.taskId;
    const existing = useTaskStore(s => s.tasks.find(t => t.id === taskId));
    const addTask = useTaskStore(s => s.addTask);
    const updateTask = useTaskStore(s => s.updateTask);

    const [title, setTitle] = useState(existing?.title ?? '');
    const [tag, setTag] = useState(existing?.tag ?? '');
    const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'medium');
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

    if (taskId && !existing) {
        return (
            <View style={[styles.center, { backgroundColor: palette.raelynn }]}>
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
            outdoor,
            subtasks: pending ? [...subtasks, { title: pending, done: false }] : subtasks,
        };

        const result = taskId ? updateTask(taskId, input) : addTask(input);
        if (result.ok) {
            savedRef.current = true;
            navigation.goBack();
            return;
        }
        if (result.notFound) {
            navigation.goBack();
            return;
        }
        setErrors(result.errors);
    };

    const inputStyle = (hasError: boolean) => [
        styles.input,
        {
            backgroundColor: colors.surface,
            borderColor: hasError ? colors.danger : colors.border,
            color: colors.text,
        },
    ];
    const pickerTheme = isDark ? 'dark' : 'light';

    return (
        <View style={[styles.root, { backgroundColor: palette.linenCream }]}>
            <ScreenHeader variant="close" title={taskId ? 'Edit Task' : 'New Task'} />
            <ScrollView
                style={[styles.root, { backgroundColor: palette.raelynn }]}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets>
                <Field label="Title" error={errors.title}>
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

                <Field label="When" error={errors.date ?? errors.start ?? errors.end}>
                    <PickerRow label="Date">
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
                    </PickerRow>
                    <DateTimePicker
                        value={fromTimeString(start)}
                        mode="time"
                        display="compact"
                        themeVariant={pickerTheme}
                        onValueChange={(_, d) => {
                            setStart(toTimeString(d));
                            clearError('start');
                        }}
                    />
                    {end === null ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => setEnd(addMinutes(start, 60))}
                            style={styles.addEnd}>
                            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                            <Text style={{ color: colors.text }}>Add end time</Text>
                        </Pressable>
                    ) : (
                        <PickerRow label="End">
                            <View style={styles.endControls}>
                                <DateTimePicker
                                    value={fromTimeString(end)}
                                    mode="time"
                                    display="compact"
                                    themeVariant={pickerTheme}
                                    onValueChange={(_, d) => {
                                        setEnd(toTimeString(d));
                                        clearError('end');
                                    }}
                                />
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Remove end time"
                                    hitSlop={8}
                                    onPress={() => {
                                        setEnd(null);
                                        clearError('end');
                                    }}>
                                    <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                                </Pressable>
                            </View>
                        </PickerRow>
                    )}
                </Field>

                <Field label="Tag" error={errors.tag}>
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

                <View
                    style={[styles.pickerRow, styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

                <Field label="Subtasks">
                    {subtasks.map((s, i) => (
                        <View
                            key={s.id ?? `new-${i}`}
                            style={[styles.pickerRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                            style={[styles.addButton, { backgroundColor: colors.surfaceAlt }]}>
                            <Ionicons name="add" size={22} color={colors.text} />
                        </Pressable>
                    </View>
                </Field>

                <Pressable
                    accessibilityRole="button"
                    onPress={handleSave}
                    style={[styles.save, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.saveText, { color: colors.onPrimary }]}>
                        {taskId ? 'Save changes' : 'Add task'}
                    </Text>
                </Pressable>

                <Pressable accessibilityRole="button" onPress={navigation.goBack} style={styles.cancel}>
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.body }}>Cancel</Text>
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
    field: { marginBottom: spacing.lg, gap: spacing.sm },
    label: { fontSize: fontSize.caption + 1, fontWeight: '600', textTransform: 'uppercase' },
    error: { fontSize: fontSize.caption + 1 },
    input: {
        borderWidth: 1,
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
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 48,
    },
    pickerLabel: { fontSize: fontSize.body },
    endControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    addEnd: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
    switchRow: { marginBottom: spacing.lg },
    switchText: { flex: 1 },
    hint: { fontSize: fontSize.caption + 1, marginTop: 2 },
    subtaskText: { flex: 1, fontSize: fontSize.body },
    subtaskInputRow: { flexDirection: 'row', gap: spacing.sm },
    subtaskInput: { flex: 1 },
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
});
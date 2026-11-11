import React, { useEffect, useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import type { Priority, SubtaskInput, TaskInput, ValidationErrors } from '../../types/task';

import { useTheme } from '../../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../../theme/tokens';
import { PRIORITIES, PRIORITY_COLOR, PRIORITY_LABEL } from '../../theme/priority';

import { useTaskStore } from '../../store/useTaskStore';

import { addMinutes, fromDateString, fromTimeString, toDateString, toTimeString } from '../../utils/date';
import { TAG_MAX, TITLE_MAX } from '../../utils/taskValidation';

// ─── Helper components ───────────────────────────────────────────────────────

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
        <View style={formStyles.field}>
            <Text style={[formStyles.label, { color: colors.textMuted }]}>{label}</Text>
            {children}
            {error ? <Text style={[formStyles.error, { color: colors.danger }]}>{error}</Text> : null}
        </View>
    );
}

function PickerRow({ label, children }: { label: string; children: React.ReactNode }) {
    const { colors } = useTheme();
    return (
        <View style={[formStyles.pickerRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[formStyles.pickerLabel, { color: colors.text }]}>{label}</Text>
            {children}
        </View>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
    title: string;
    subtitle?: string;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
    isFlipped: boolean;
    onFlipBack: () => void;
    initialDate?: string;
}

export default function FlippableNotebookCard({
    title,
    subtitle,
    style,
    children,
    isFlipped,
    onFlipBack,
    initialDate,
}: Props) {
    const { colors, isDark } = useTheme();

    // ─── Animation ──────────────────────────────────────────────────────────
    const rotate = useSharedValue(0); // 0 = front, 1 = back
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    useEffect(() => {
        if (isFlipped) {
            rotate.value = withSpring(1, { damping: 14, stiffness: 100 });
            scale.value = withSpring(1.03, { damping: 14, stiffness: 100 });
            translateY.value = withSpring(-8, { damping: 14, stiffness: 100 });
        } else {
            rotate.value = withSpring(0, { damping: 14, stiffness: 100 });
            scale.value = withSpring(1, { damping: 14, stiffness: 100 });
            translateY.value = withSpring(0, { damping: 14, stiffness: 100 });
        }
    }, [isFlipped]);

    // Container wraps both sides and applies scale/translateY
    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { scaleX: scale.value },
            { scaleY: scale.value },
            { translateY: translateY.value },
        ],
    }));

    // Front: 0→180
    const frontStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(rotate.value, [0, 1], [0, 180]);
        return {
            transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
        };
    });

    // Back: -180→0
    const backStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(rotate.value, [0, 1], [-180, 0]);
        return {
            transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
        };
    });

    // ─── Form state ─────────────────────────────────────────────────────────
    const addTask = useTaskStore(s => s.addTask);
    const savedRef = useRef<boolean>(false);

    const defaultDate = initialDate ?? toDateString(new Date());

    const [formTitle, setFormTitle] = useState('');
    const [tag, setTag] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [date, setDate] = useState(defaultDate);
    const [start, setStart] = useState('09:00');
    const [end, setEnd] = useState<string | null>(null);
    const [outdoor, setOutdoor] = useState(false);
    const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Reset form when card flips back to front
    useEffect(() => {
        if (!isFlipped) {
            savedRef.current = false;
            setFormTitle('');
            setTag('');
            setPriority('medium');
            setDate(initialDate ?? toDateString(new Date()));
            setStart('09:00');
            setEnd(null);
            setOutdoor(false);
            setSubtasks([]);
            setNewSubtask('');
            setErrors({});
        }
    }, [isFlipped]);

    // Update date if initialDate changes while flipped
    useEffect(() => {
        if (initialDate) {
            setDate(initialDate);
        }
    }, [initialDate]);

    const clearError = (key: keyof ValidationErrors) =>
        setErrors(prev => ({ ...prev, [key]: undefined }));

    const addSubtask = () => {
        const text = newSubtask.trim();
        if (!text) return;
        setSubtasks(prev => [...prev, { title: text, done: false }]);
        setNewSubtask('');
    };

    const handleSave = () => {
        if (savedRef.current) return;
        const pending = newSubtask.trim();
        const input: TaskInput = {
            title: formTitle,
            date,
            start,
            end: end ?? undefined,
            tag,
            priority,
            outdoor,
            subtasks: pending ? [...subtasks, { title: pending, done: false }] : subtasks,
        };
        const result = addTask(input);
        if (result.ok) {
            savedRef.current = true;
            onFlipBack();
            return;
        }
        setErrors(result.errors);
    };

    const handleCancel = () => {
        onFlipBack();
    };

    const inputStyle = (hasError: boolean) => [
        formStyles.input,
        {
            backgroundColor: colors.surface,
            borderColor: hasError ? colors.danger : colors.border,
            color: colors.text,
        },
    ];
    const pickerTheme = isDark ? 'dark' : 'light';

    // ─── Rings (shared visual element) ───────────────────────────────────────
    const Rings = () => (
        <View style={styles.rings} pointerEvents="none">
            {Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={[styles.ring, { backgroundColor: colors.ring }]} />
            ))}
        </View>
    );

    return (
        <Animated.View style={[style, containerStyle]}>
            {/* ── FRONT ── */}
            <Animated.View style={[styles.card, { backgroundColor: colors.surface }, frontStyle]}>
                <Rings />
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {subtitle ? (
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
                ) : null}
                {children}
            </Animated.View>

            {/* ── BACK ── */}
            <Animated.View style={[styles.card, styles.cardBack, { backgroundColor: colors.surface }, backStyle]}>
                <Rings />
                <Text style={[styles.title, { color: colors.text }]}>New Task</Text>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets
                    contentContainerStyle={formStyles.content}>

                    <Field label="Title" error={errors.title}>
                        <TextInput
                            accessibilityLabel="Task title"
                            value={formTitle}
                            onChangeText={t => {
                                setFormTitle(t);
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
                        <View style={formStyles.chips}>
                            {PRIORITIES.map(p => {
                                const active = p === priority;
                                return (
                                    <Pressable
                                        key={p}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: active }}
                                        onPress={() => setPriority(p)}
                                        style={[
                                            formStyles.chip,
                                            { backgroundColor: PRIORITY_COLOR[p] },
                                            active ? { borderColor: colors.text } : formStyles.chipInactive,
                                        ]}>
                                        <Text style={formStyles.chipText}>{PRIORITY_LABEL[p]}</Text>
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
                                style={formStyles.addEnd}>
                                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                                <Text style={{ color: colors.text }}>Add end time</Text>
                            </Pressable>
                        ) : (
                            <PickerRow label="End">
                                <View style={formStyles.endControls}>
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
                        style={[formStyles.pickerRow, formStyles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={formStyles.switchText}>
                            <Text style={[formStyles.pickerLabel, { color: colors.text }]}>Outdoor task</Text>
                            <Text style={[formStyles.hint, { color: colors.textMuted }]}>
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
                                style={[formStyles.pickerRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[formStyles.subtaskText, { color: colors.text }]}>{s.title}</Text>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remove ${s.title}`}
                                    hitSlop={8}
                                    onPress={() => setSubtasks(prev => prev.filter((_, idx) => idx !== i))}>
                                    <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                                </Pressable>
                            </View>
                        ))}
                        <View style={formStyles.subtaskInputRow}>
                            <TextInput
                                accessibilityLabel="New subtask"
                                value={newSubtask}
                                onChangeText={setNewSubtask}
                                onSubmitEditing={addSubtask}
                                placeholder="Add a subtask"
                                placeholderTextColor={colors.textMuted}
                                returnKeyType="done"
                                style={[inputStyle(false), formStyles.subtaskInput]}
                            />
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Add subtask"
                                onPress={addSubtask}
                                style={[formStyles.addButton, { backgroundColor: colors.surfaceAlt }]}>
                                <Ionicons name="add" size={22} color={colors.text} />
                            </Pressable>
                        </View>
                    </Field>

                    <Pressable
                        accessibilityRole="button"
                        onPress={handleSave}
                        style={[formStyles.save, { backgroundColor: colors.primary }]}>
                        <Text style={[formStyles.saveText, { color: colors.onPrimary }]}>Add task</Text>
                    </Pressable>

                    <Pressable accessibilityRole="button" onPress={handleCancel} style={formStyles.cancel}>
                        <Text style={{ color: colors.textMuted, fontSize: fontSize.body }}>Cancel</Text>
                    </Pressable>
                </ScrollView>
            </Animated.View>
        </Animated.View>
    );
}

// ─── Card shell styles (mirrors NotebookCard) ────────────────────────────────
const styles = StyleSheet.create({
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
        borderBottomLeftRadius: 6,
        borderTopLeftRadius: 6,
        borderBottomRightRadius: 6,
        borderTopRightRadius: 6,
    },
    card: {
        borderRadius: radius.lg,
        paddingTop: spacing.xl + spacing.md,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        shadowColor: palette.bistre,
        shadowOpacity: 0.2,
        shadowOffset: { width: 4, height: 4 },
        elevation: 6,
        // Both sides must fill the same space — back is absolute so they overlap
    },
    cardBack: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    title: { fontSize: fontSize.body + 2, fontWeight: '700', textAlign: 'center' },
    subtitle: {
        fontSize: fontSize.caption + 1,
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
});

// ─── Form-specific styles ────────────────────────────────────────────────────
const formStyles = StyleSheet.create({
    content: { paddingTop: spacing.sm, paddingBottom: spacing.xl * 2 },
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

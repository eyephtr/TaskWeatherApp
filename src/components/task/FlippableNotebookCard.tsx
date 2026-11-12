/**
 * FlippableNotebookCard
 *
 * Renders a NotebookCard that physically flips (rotateY) when isFlipped=true.
 * The card expands to fill its container during the flip so the back face
 * (add-task form) has plenty of room.
 *
 * Layout contract:
 *   The parent must give the Animated.View a concrete size (flex:1 / fixed height).
 *   Both front and back faces are absolutely positioned inside that container so
 *   they always occupy exactly the same rect — no layout shift on either side.
 */
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

// ─── Helper sub-components ────────────────────────────────────────────────────

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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
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

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
    /** Content rendered on the front face (task list) */
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    style?: StyleProp<ViewStyle>;
    /** When true the card flips to show the add-task form */
    isFlipped: boolean;
    /** Called after a successful save or explicit cancel */
    onFlipBack: () => void;
    /** Pre-fills the date field */
    initialDate?: string;
}

export default function FlippableNotebookCard({
    children,
    title,
    subtitle,
    style,
    isFlipped,
    onFlipBack,
    initialDate,
}: Props) {
    const { colors, isDark } = useTheme();

    // ─── Flip animation ───────────────────────────────────────────────────────
    // progress: 0 = showing front, 1 = showing back
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withSpring(isFlipped ? 1 : 0, {
            damping: 18,
            stiffness: 90,
            mass: 1,
        });
    }, [isFlipped]);

    // Front face: rotates 0 → 90 (disappears edge-on), then stays hidden
    const frontAnimStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(progress.value, [0, 0.5, 1], [0, -90, -90]);
        return {
            transform: [{ perspective: 1400 }, { rotateY: `${rotateY}deg` }],
            // hide once fully rotated away so it doesn't block touch on the back
            opacity: progress.value < 0.5 ? 1 : 0,
        };
    });

    // Back face: starts edge-on (90 deg), rotates to 0
    const backAnimStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(progress.value, [0, 0.5, 1], [90, 90, 0]);
        return {
            transform: [{ perspective: 1400 }, { rotateY: `${rotateY}deg` }],
            opacity: progress.value >= 0.5 ? 1 : 0,
        };
    });

    // ─── Form state ───────────────────────────────────────────────────────────
    const addTask = useTaskStore(s => s.addTask);
    const savedRef = useRef(false);

    const [formTitle, setFormTitle] = useState('');
    const [tag, setTag] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [date, setDate] = useState(initialDate ?? toDateString(new Date()));
    const [start, setStart] = useState('09:00');
    const [end, setEnd] = useState<string | null>(null);
    const [outdoor, setOutdoor] = useState(false);
    const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        if (initialDate) setDate(initialDate);
    }, [initialDate]);

    // Reset when card flips back to front
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

    const inputStyle = (hasError: boolean) => [
        formStyles.input,
        {
            backgroundColor: colors.surface,
            borderColor: hasError ? colors.danger : colors.border,
            color: colors.text,
        },
    ];
    const pickerTheme = isDark ? 'dark' : 'light';

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        // Outer view: fills the space the caller allocated (flex:1 etc.)
        <View style={[styles.container, style]}>

            {/* ── FRONT FACE ── */}
            <Animated.View
                style={[styles.face, { backgroundColor: colors.surface }, frontAnimStyle]}
                pointerEvents={isFlipped ? 'none' : 'auto'}>
                <Rings />
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {subtitle ? (
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
                ) : null}
                {children}
            </Animated.View>

            {/* ── BACK FACE ── */}
            <Animated.View
                style={[styles.face, { backgroundColor: colors.surface }, backAnimStyle]}
                pointerEvents={isFlipped ? 'auto' : 'none'}>
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
                            onChangeText={t => { setFormTitle(t); clearError('title'); }}
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
                                onValueChange={(_, d) => { setDate(toDateString(d)); clearError('date'); }}
                            />
                        </PickerRow>
                        <DateTimePicker
                            value={fromTimeString(start)}
                            mode="time"
                            display="compact"
                            themeVariant={pickerTheme}
                            onValueChange={(_, d) => { setStart(toTimeString(d)); clearError('start'); }}
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
                                        onValueChange={(_, d) => { setEnd(toTimeString(d)); clearError('end'); }}
                                    />
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Remove end time"
                                        hitSlop={8}
                                        onPress={() => { setEnd(null); clearError('end'); }}>
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
                            onChangeText={t => { setTag(t); clearError('tag'); }}
                            placeholder="General"
                            placeholderTextColor={colors.textMuted}
                            maxLength={TAG_MAX + 10}
                            style={inputStyle(!!errors.tag)}
                        />
                    </Field>

                    <View style={[formStyles.pickerRow, formStyles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

                    <Pressable accessibilityRole="button" onPress={onFlipBack} style={formStyles.cancel}>
                        <Text style={{ color: colors.textMuted, fontSize: fontSize.body }}>Cancel</Text>
                    </Pressable>
                </ScrollView>
            </Animated.View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Outer container — caller sets flex:1 / height via the `style` prop
    container: {
        // No flex here; the parent controls size via `style` prop
    },
    // Both faces fill the container absolutely so they overlap perfectly
    face: {
        ...StyleSheet.absoluteFill,
        borderRadius: radius.lg,
        paddingTop: spacing.xl + spacing.md,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        shadowColor: palette.bistre,
        shadowOpacity: 0.2,
        shadowOffset: { width: 4, height: 4 },
        elevation: 6,
        overflow: 'hidden',
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
    title: { fontSize: fontSize.body + 2, fontWeight: '700', textAlign: 'center' },
    subtitle: {
        fontSize: fontSize.caption + 1,
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
});

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

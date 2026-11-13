import React, { useEffect, useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    useWindowDimensions,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import type { Priority, SubtaskInput, TaskInput, ValidationErrors } from '../../types/task';

import { useTheme } from '../../theme/ThemeProvider';
import { DEFAULT_TASK_COLOR, fontSize, palette, radius, spacing, type TaskColorKey } from '../../theme/tokens';
import { PRIORITIES, PRIORITY_COLOR, PRIORITY_LABEL } from '../../theme/priority';

import { useTaskStore } from '../../store/useTaskStore';

import TimeRangeRow from './TimeRangeRow';
import ColorPicker from './ColorPicker';

import { fromDateString, toDateString } from '../../utils/date';
import { TAG_MAX, TITLE_MAX } from '../../utils/taskValidation';

const FLIP_DURATION = 600;
const EXPANDED_SIDE = spacing.md;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Add-task form (หน้าหลังของการ์ด) ─────────────────────────────────────────

function AddTaskForm({
    isVisible,
    onClose,
    initialDate,
}: {
    isVisible: boolean;
    onClose: () => void;
    initialDate?: string;
}) {
    const { colors, isDark } = useTheme();
    const addTask = useTaskStore(s => s.addTask);
    const savedRef = useRef(false);

    const [formTitle, setFormTitle] = useState('');
    const [tag, setTag] = useState('');
    const [priority, setPriority] = useState<Priority>('none');
    const [color, setColor] = useState<TaskColorKey>(DEFAULT_TASK_COLOR);
    const [date, setDate] = useState(initialDate ?? toDateString(new Date()));
    const [start, setStart] = useState('09:00');
    const [end, setEnd] = useState<string | null>(null);
    const [outdoor, setOutdoor] = useState(false);
    const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [errors, setErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        if (isVisible) {
            savedRef.current = false;
            setFormTitle('');
            setTag('');
            setPriority('none');
            setColor(DEFAULT_TASK_COLOR);
            setDate(toDateString(new Date()));
            setStart('09:00');
            setEnd(null);
            setOutdoor(false);
            setSubtasks([]);
            setNewSubtask('');
            setErrors({});
        }
    }, [isVisible]);

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
            color,
            outdoor,
            subtasks: pending ? [...subtasks, { title: pending, done: false }] : subtasks,
        };
        const result = addTask(input);
        if (result.ok) {
            savedRef.current = true;
            onClose();
            return;
        }
        setErrors(result.errors);
    };

    const inputStyle = (hasError: boolean) => [
        formStyles.input,
        {
            backgroundColor: colors.field,
            borderColor: hasError ? colors.danger : 'transparent',
            color: colors.text,
        },
    ];
    const pickerTheme = isDark ? 'dark' : 'light';

    return (
        <>
            <View style={styles.formHeader}>
                <View style={styles.headerSide} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Task</Text>
                <View style={[styles.headerSide, styles.headerSideRight]}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                        hitSlop={10}
                        onPress={onClose}
                        style={[styles.closeButton, { backgroundColor: colors.surfaceAlt }]}>
                        <Ionicons name="close" size={20} color={colors.text} />
                    </Pressable>
                </View>
            </View>
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

                <Field label="Color">
                    <ColorPicker value={color} onChange={setColor} />
                </Field>

                <Field label="Date & Time" error={errors.date ?? errors.start ?? errors.end}>
                    <View style={[formStyles.box, { backgroundColor: colors.field }]}>
                        <DateTimePicker
                            value={fromDateString(date)}
                            mode="date"
                            display="compact"
                            locale="en-GB"
                            themeVariant={pickerTheme}
                            onValueChange={(_, d) => { setDate(toDateString(d)); clearError('date'); }}
                        />
                        <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
                    </View>
                    <TimeRangeRow
                        start={start}
                        end={end}
                        onChangeStart={v => { setStart(v); clearError('start'); }}
                        onChangeEnd={v => { setEnd(v); clearError('end'); }}
                    />
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

                <View style={[formStyles.pickerRow, formStyles.switchRow, { backgroundColor: colors.field }]}>
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
                            style={[formStyles.addButton, { backgroundColor: colors.field }]}>
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
            </ScrollView>
        </>
    );
}

// ─── Flippable card ───────────────────────────────────────────────────────────

interface Props {
    isFlipped: boolean;
    onClose: () => void;
    initialDate?: string;
    title: string;
    subtitle?: string;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
    headerRight?: React.ReactNode;
}

export function FlippableNotebookCard({
    isFlipped,
    onClose,
    initialDate,
    title,
    subtitle,
    style,
    children,
    headerRight,
}: Props) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { width: winW, height: winH } = useWindowDimensions();

    const progress = useSharedValue(0);

    const sx = useSharedValue(0);
    const sy = useSharedValue(0);
    const sw = useSharedValue(0);
    const sh = useSharedValue(0);

    const ex = EXPANDED_SIDE;
    const ey = insets.top + spacing.md;
    const ew = winW - EXPANDED_SIDE * 2;
    const expandedBottom = winH - insets.bottom - spacing.sm;

    useEffect(() => {
        progress.value = withTiming(isFlipped ? 1 : 0, {
            duration: FLIP_DURATION,
            easing: Easing.inOut(Easing.cubic),
        });
    }, [isFlipped, progress]);

    const containerStyle = useAnimatedStyle(() => {
        const endHeight = expandedBottom - ey;
        return {
            opacity: sw.value > 0 ? 1 : 0,
            left: interpolate(progress.value, [0, 1], [sx.value, ex]),
            top: interpolate(progress.value, [0, 1], [sy.value, ey]),
            width: interpolate(progress.value, [0, 1], [sw.value, ew]),
            height: interpolate(progress.value, [0, 1], [sh.value, endHeight]),
        };
    });

    const frontStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1200 },
            { rotateY: `${interpolate(progress.value, [0, 1], [0, 180])}deg` },
        ],
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [
            { perspective: 1200 },
            { rotateY: `${interpolate(progress.value, [0, 1], [180, 360])}deg` },
        ],
    }));

    return (
        <>
            <View
                pointerEvents="none"
                style={[style, styles.placeholder]}
                onLayout={e => {
                    const { x, y, width, height } = e.nativeEvent.layout;
                    const first = sw.value === 0;
                    const cfg = { duration: 300, easing: Easing.out(Easing.cubic) };
                    sx.value = first ? x : withTiming(x, cfg);
                    sy.value = first ? y : withTiming(y, cfg);
                    sw.value = first ? width : withTiming(width, cfg);
                    sh.value = first ? height : withTiming(height, cfg);
                }}
            />

            <Animated.View style={[styles.container, containerStyle]}>
                {/* FRONT: list */}
                <Animated.View
                    pointerEvents={isFlipped ? 'none' : 'auto'}
                    style={[styles.face, { backgroundColor: colors.surface }, frontStyle]}>
                    <Rings />
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
                    {subtitle ? (
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
                    ) : null}
                    {children}
                </Animated.View>

                {/* BACK: add task */}
                <Animated.View
                    pointerEvents={isFlipped ? 'auto' : 'none'}
                    style={[styles.face, { backgroundColor: colors.surface }, backStyle]}>
                    <Rings />
                    <AddTaskForm isVisible={isFlipped} onClose={onClose} initialDate={initialDate} />
                </Animated.View>
            </Animated.View>
        </>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    placeholder: { opacity: 0 },
    container: {
        position: 'absolute',
        zIndex: 10,
        elevation: 10,
    },
    face: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backfaceVisibility: 'hidden',
        borderRadius: radius.lg,
        paddingTop: spacing.xl + spacing.md,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        shadowColor: palette.bistre,
        shadowOpacity: 0.2,
        shadowOffset: { width: 4, height: 4 },
        elevation: 6,
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
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerSide: { width: 36 },
    headerSideRight: { alignItems: 'flex-end' },
    headerTitle: {
        flex: 1,
        fontSize: fontSize.body + 2,
        fontWeight: '700',
        textAlign: 'center',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRight: { position: 'absolute', top: spacing.xl + spacing.sm, right: spacing.lg, zIndex: 1 },
});

const formStyles = StyleSheet.create({
    content: { paddingTop: spacing.md, paddingBottom: spacing.xl },
    field: { marginBottom: spacing.xl, gap: spacing.sm },
    label: { fontSize: fontSize.body - 1, fontWeight: '700' },
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
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 48,
    },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
        paddingLeft: spacing.xs,
        paddingRight: spacing.md,
        borderRadius: radius.md,
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
});
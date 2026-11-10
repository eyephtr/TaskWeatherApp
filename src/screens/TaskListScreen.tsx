import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../theme/tokens';
import NotebookCard from '../components/NotebookCard';
import { TAB_BAR_CLEARANCE } from '../components/FloatingTabBar';
import { buildMockTasks } from '../mock/mockTasks';
import { formatDate, toDateString } from '../utils/date';

type CalendarProps = React.ComponentProps<typeof Calendar>;

export default function TaskListScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const today = useMemo(() => toDateString(new Date()), []);
    const [selected, setSelected] = useState(today);
    const tasksByDate = useMemo(buildMockTasks, []);

    const priorityColor = {
        high: colors.priorityHigh,
        medium: colors.priorityMedium,
        low: colors.priorityLow,
    };

    const markedDates = useMemo(() => {
        const marks: NonNullable<CalendarProps['markedDates']> = {};
        Object.entries(tasksByDate).forEach(([date, list]) => {
            const priorities = Array.from(new Set(list.map(t => t.priority))).slice(0, 3);
            marks[date] = {
                dots: priorities.map(p => ({
                    key: p,
                    color:
                        p === 'high'
                            ? colors.priorityHigh
                            : p === 'medium'
                              ? colors.priorityMedium
                              : colors.priorityLow,
                })),
            };
        });
        marks[selected] = { ...marks[selected], selected: true };
        return marks;
    }, [tasksByDate, selected, colors]);

    const calendarTheme = useMemo<CalendarProps['theme']>(
        () => ({
            calendarBackground: 'transparent',
            textSectionTitleColor: colors.textMuted,
            dayTextColor: colors.text,
            textDisabledColor: colors.textMuted,
            todayTextColor: colors.primary,
            selectedDayBackgroundColor: colors.text,
            selectedDayTextColor: colors.background,
            monthTextColor: colors.text,
            arrowColor: colors.text,
            textMonthFontWeight: '700',
            textDayFontWeight: '500',
            textDayHeaderFontWeight: '500',
        }),
        [colors],
    );

    const tasks = tasksByDate[selected] ?? [];
    const doneCount = tasks.filter(t => t.done).length;
    const title = selected === today ? "Today's Tasks" : formatDate(selected);
    const subtitle = tasks.length
        ? `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} · ${doneCount} done`
        : 'Nothing planned';

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <View style={{ paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg }}>
                <Text style={[styles.heading, { color: colors.text }]}>My Tasks</Text>
            </View>

            <View style={styles.calendarWrap}>
                <Calendar
                    key={isDark ? 'dark' : 'light'}
                    markingType="multi-dot"
                    markedDates={markedDates}
                    theme={calendarTheme}
                    firstDay={0}
                    hideExtraDays
                    enableSwipeMonths
                    onDayPress={(day: DateData) => setSelected(day.dateString)}
                />
            </View>

            <NotebookCard title={title} subtitle={subtitle} style={styles.note}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: spacing.md }}>
                    {tasks.length === 0 ? (
                        <Text style={[styles.empty, { color: colors.textMuted }]}>
                            No tasks on this day
                        </Text>
                    ) : (
                        tasks.map(t => (
                            <Pressable
                                key={t.id}
                                accessibilityRole="button"
                                onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                                style={[styles.row, { borderBottomColor: colors.border }]}>
                                <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
                                    <Ionicons
                                        name={t.icon}
                                        size={20}
                                        color={t.done ? colors.textMuted : colors.text}
                                    />
                                </View>
                                <Text
                                    numberOfLines={2}
                                    style={[
                                        styles.rowTitle,
                                        { color: t.done ? colors.textMuted : colors.text },
                                        t.done && styles.done,
                                    ]}>
                                    {t.title}
                                </Text>
                                <View style={[styles.dot, { backgroundColor: priorityColor[t.priority] }]} />
                            </Pressable>
                        ))
                    )}
                </ScrollView>
            </NotebookCard>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    heading: { fontSize: fontSize.title, fontWeight: '700' },
    calendarWrap: { paddingHorizontal: spacing.sm, paddingBottom: spacing.sm },
    note: { flex: 1, marginHorizontal: spacing.lg, marginBottom: TAB_BAR_CLEARANCE },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowTitle: { flex: 1, fontSize: fontSize.body, fontWeight: '600' },
    done: { textDecorationLine: 'line-through' },
    dot: { width: 10, height: 10, borderRadius: radius.pill },
    empty: { textAlign: 'center', paddingVertical: spacing.xl, fontSize: fontSize.body },
});
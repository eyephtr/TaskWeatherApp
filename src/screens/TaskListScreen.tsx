import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CalendarList, type DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';
import NotebookCard from '../components/NotebookCard';
import AgendaItem from '../components/AgendaItem';
import { TAB_BAR_CLEARANCE } from '../components/FloatingTabBar';
import { buildMockTasks, type MockTask } from '../mock/mockTasks';
import { formatDate, monthNames, monthStartOf, toDateString } from '../utils/date';

type CalendarProps = React.ComponentProps<typeof CalendarList>;

const CALENDAR_HEIGHT = 262;
const PLUS_THICKNESS = 3;
const PLUS_SIZE = 20;

const renderNoHeader = () => null;

export default function TaskListScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const today = useMemo(() => toDateString(new Date()), []);
    const [selected, setSelected] = useState(today);
    const [visibleMonth, setVisibleMonth] = useState(() => monthStartOf(today));
    const tasksByDate = useMemo(buildMockTasks, []);

    const [doneOverrides, setDoneOverrides] = useState<Record<string, boolean>>({});
    const isDone = (t: MockTask) => doneOverrides[t.id] ?? !!t.done;
    const toggleDone = (t: MockTask) =>
        setDoneOverrides(prev => ({ ...prev, [t.id]: !(prev[t.id] ?? !!t.done) }));

    useEffect(() => {
        setVisibleMonth(monthStartOf(today));
    }, [isDark, today]);

    const [visibleYear, visibleMonthNumber] = visibleMonth.split('-').map(Number);

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
            textDayFontWeight: '500',
            textDayHeaderFontWeight: '500',
            weekVerticalMargin: 2,
        }),
        [colors],
    );

    const tasks = useMemo(
        () => [...(tasksByDate[selected] ?? [])].sort((a, b) => a.start.localeCompare(b.start)),
        [tasksByDate, selected],
    );
    const doneCount = tasks.filter(isDone).length;
    const title = selected === today ? "Today's Tasks" : formatDate(selected);
    const subtitle = tasks.length
        ? `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} · ${doneCount} done`
        : 'Nothing planned';

    const handleAddTask = () => {
        // TODO: เปิดฟอร์มเพิ่มงาน (modal) ตอนทำส่วน data layer
    };

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <View style={[styles.headerRow, { paddingTop: insets.top + spacing.md }]}>
                <View>
                    <Text style={[styles.monthText, { color: colors.text }]}>
                        {monthNames[visibleMonthNumber - 1]}
                    </Text>
                    <Text style={[styles.yearText, { color: colors.textMuted }]}>{visibleYear}</Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add task"
                    onPress={handleAddTask}
                    style={[styles.fab, { backgroundColor: colors.primary }]}>
                    <View style={styles.plus}>
                        <View style={[styles.plusBar, styles.plusHorizontal, { backgroundColor: palette.linenCream }]} />
                        <View style={[styles.plusBar, styles.plusVertical, { backgroundColor: palette.linenCream }]} />
                    </View>
                </Pressable>
            </View>

            <CalendarList
                key={isDark ? 'dark' : 'light'}
                horizontal
                pagingEnabled
                calendarWidth={width}
                calendarHeight={CALENDAR_HEIGHT}
                calendarStyle={styles.calendarPage}
                pastScrollRange={24}
                futureScrollRange={24}
                current={today}
                onMonthChange={(m: DateData) => setVisibleMonth(monthStartOf(m.dateString))}
                renderHeader={renderNoHeader}
                markingType="multi-dot"
                markedDates={markedDates}
                theme={calendarTheme}
                firstDay={0}
                onDayPress={(day: DateData) => setSelected(day.dateString)}
            />

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
                            <AgendaItem
                                key={t.id}
                                task={t}
                                done={isDone(t)}
                                onToggle={() => toggleDone(t)}
                                onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                            />
                        ))
                    )}
                </ScrollView>
            </NotebookCard>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    monthText: { fontSize: fontSize.display - 4, fontWeight: '700' },
    yearText: { fontSize: fontSize.body, marginTop: -2 },
    fab: {
        width: 45,
        height: 45,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plus: {
        width: PLUS_SIZE,
        height: PLUS_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusBar: { position: 'absolute', borderRadius: PLUS_THICKNESS / 2 },
    plusHorizontal: { width: PLUS_SIZE, height: PLUS_THICKNESS },
    plusVertical: { width: PLUS_THICKNESS, height: PLUS_SIZE },
    calendarPage: { paddingHorizontal: spacing.sm },
    note: { flex: 1, marginHorizontal: spacing.lg, marginBottom: TAB_BAR_CLEARANCE },
    empty: { textAlign: 'center', paddingVertical: spacing.xl, fontSize: fontSize.body },
});
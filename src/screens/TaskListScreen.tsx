import React, { useEffect, useMemo, useState } from 'react';
import {
    LayoutAnimation,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { CalendarList, type DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, spacing } from '../theme/tokens';
import NotebookCard from '../components/NotebookCard';
import AgendaItem from '../components/AgendaItem';
import WeekStrip, { WEEK_STRIP_HEIGHT } from '../components/WeekStrip';
import IconSegmentedControl, { type SegmentOption } from '../components/IconSegmentedControl';
import { TAB_BAR_CLEARANCE } from '../components/FloatingTabBar';
import { useTaskStore } from '../store/useTaskStore';
import { groupByDate } from '../utils/taskSelectors';
import { formatDate, monthNames, monthStartOf, toDateString } from '../utils/date';

type CalendarProps = React.ComponentProps<typeof CalendarList>;
type ViewMode = 'list' | 'calendar';

const CALENDAR_HEIGHT = 262;

const VIEW_OPTIONS: readonly SegmentOption<ViewMode>[] = [
    { key: 'list', icon: 'list-outline', label: 'List view' },
    { key: 'calendar', icon: 'calendar-outline', label: 'Calendar view' },
];

const renderNoHeader = () => null;

export default function TaskListScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const today = useMemo(() => toDateString(new Date()), []);
    const [mode, setMode] = useState<ViewMode>('calendar');
    const [selected, setSelected] = useState(today);

    const [calendarStart, setCalendarStart] = useState(today);
    const [visibleMonth, setVisibleMonth] = useState(() => monthStartOf(today));

    const allTasks = useTaskStore(s => s.tasks);
    const toggleDone = useTaskStore(s => s.toggleDone);
    const toggleSubtask = useTaskStore(s => s.toggleSubtask);
    const tasksByDate = useMemo(() => groupByDate(allTasks), [allTasks]);

    useEffect(() => {
        setVisibleMonth(monthStartOf(calendarStart));
    }, [isDark, calendarStart]);

    const handleModeChange = (next: ViewMode) => {
        if (next === mode) {
            return;
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (next === 'calendar') {
            setCalendarStart(selected);
        }
        setMode(next);
    };

    // โหมดรายการ: เดือนตามวันที่เลือก / โหมดปฏิทิน: เดือนที่กำลังเลื่อนดู
    const headerMonth = mode === 'list' ? monthStartOf(selected) : visibleMonth;
    const [headerYear, headerMonthNumber] = headerMonth.split('-').map(Number);

    // สีจุดตามความสำคัญของงานในแต่ละวัน (ใช้ทั้งปฏิทินรายเดือนและแถบสัปดาห์)
    const dotsByDate = useMemo(() => {
        const map: Record<string, string[]> = {};
        Object.entries(tasksByDate).forEach(([date, list]) => {
            const priorities = Array.from(new Set(list.map(t => t.priority))).slice(0, 3);
            map[date] = priorities.map(p =>
                p === 'high'
                    ? colors.priorityHigh
                    : p === 'medium'
                        ? colors.priorityMedium
                        : colors.priorityLow,
            );
        });
        return map;
    }, [tasksByDate, colors]);

    const markedDates = useMemo(() => {
        const marks: NonNullable<CalendarProps['markedDates']> = {};
        Object.entries(dotsByDate).forEach(([date, dotColors]) => {
            marks[date] = { dots: dotColors.map((color, i) => ({ key: `${date}-${i}`, color })) };
        });
        marks[selected] = { ...marks[selected], selected: true };
        return marks;
    }, [dotsByDate, selected]);

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
    const doneCount = tasks.filter(t => t.done).length;
    const title = selected === today ? "Today's Tasks" : formatDate(selected);
    const subtitle = tasks.length
        ? `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} · ${doneCount} done`
        : 'Nothing planned';

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <View style={[styles.headerRow, { paddingTop: insets.top + spacing.md }]}>
                <View>
                    <Text style={[styles.monthText, { color: colors.text }]}>
                        {monthNames[headerMonthNumber - 1]}
                    </Text>
                    <Text style={[styles.yearText, { color: colors.textMuted }]}>{headerYear}</Text>
                </View>

                <IconSegmentedControl options={VIEW_OPTIONS} value={mode} onChange={handleModeChange} />
            </View>

            <View
                style={[
                    styles.calendarArea,
                    { height: mode === 'calendar' ? CALENDAR_HEIGHT : WEEK_STRIP_HEIGHT },
                ]}>
                {mode === 'calendar' ? (
                    <CalendarList
                        key={isDark ? 'dark' : 'light'}
                        horizontal
                        pagingEnabled
                        calendarWidth={width}
                        calendarHeight={CALENDAR_HEIGHT}
                        calendarStyle={styles.calendarPage}
                        pastScrollRange={24}
                        futureScrollRange={24}
                        current={calendarStart}
                        onMonthChange={(m: DateData) => setVisibleMonth(monthStartOf(m.dateString))}
                        renderHeader={renderNoHeader}
                        markingType="multi-dot"
                        markedDates={markedDates}
                        theme={calendarTheme}
                        firstDay={0}
                        onDayPress={(day: DateData) => setSelected(day.dateString)}
                    />
                ) : (
                    <WeekStrip selected={selected} today={today} dots={dotsByDate} onSelect={setSelected} />
                )}
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
                            <AgendaItem
                                key={t.id}
                                task={t}
                                done={t.done}
                                onToggle={() => toggleDone(t.id)}
                                onToggleSubtask={subtaskId => toggleSubtask(t.id, subtaskId)}
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
    calendarArea: { overflow: 'hidden' },
    calendarPage: { paddingHorizontal: spacing.sm },
    note: { flex: 1, marginHorizontal: spacing.lg, marginBottom: TAB_BAR_CLEARANCE },
    empty: { textAlign: 'center', paddingVertical: spacing.xl, fontSize: fontSize.body },
});
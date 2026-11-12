import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    LayoutAnimation,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { CalendarList, type DateData } from 'react-native-calendars';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import type { RootStackParamList, TabParamList } from '../types/navigation';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';

import { useTaskStore } from '../store/useTaskStore';

import { NotebookCardFront, AddTaskOverlay } from '../components/task/FlippableNotebookCard';
import AgendaItem from '../components/task/AgendaItem';
import WeekStrip, { WEEK_STRIP_HEIGHT } from '../components/task/WeekStrip';
import IconSegmentedControl, { type SegmentOption } from '../components/common/IconSegmentedControl';
import SearchBar from '../components/task/SearchBar';
import StatusFilter from '../components/task/StatusFilter';
import EmptyState from '../components/common/EmptyState';
import StatusBanner from '../components/common/StatusBanner';
import { TAB_BAR_CLEARANCE } from '../components/common/FloatingTabBar';

import { groupByDate, sortByDateTime, sortByStart } from '../utils/taskSelectors';
import { filterTasks, type StatusFilter as Status } from '../utils/taskFilters';
import { formatDate, monthNames, monthStartOf, toDateString } from '../utils/date';
import { useDebounce } from '../utils/useDebounce';

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
    const tabNavigation = useNavigation<import('@react-navigation/bottom-tabs').BottomTabNavigationProp<TabParamList>>();
    const route = useRoute<BottomTabScreenProps<TabParamList, 'Tasks'>['route']>();

    const today = useMemo(() => toDateString(new Date()), []);
    const [mode, setMode] = useState<ViewMode>('calendar');
    const [selected, setSelected] = useState(today);
    const [isFlipped, setIsFlipped] = useState(false);

    const [calendarStart, setCalendarStart] = useState(today);
    const [visibleMonth, setVisibleMonth] = useState(() => monthStartOf(today));

    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Status>('all');
    const searching = searchOpen && query.trim().length > 0;

    const debouncedQuery = useDebounce(query, 200);

    const allTasks = useTaskStore(s => s.tasks);
    const toggleDone = useTaskStore(s => s.toggleDone);
    const toggleSubtask = useTaskStore(s => s.toggleSubtask);
    const storeStatus = useTaskStore(s => s.status);
    const error = useTaskStore(s => s.error);
    const clearError = useTaskStore(s => s.clearError);

    const tasksByDate = useMemo(() => groupByDate(allTasks), [allTasks]);

    useEffect(() => {
        if (route.params?.flip) {
            setIsFlipped(true);
        }
        // ปิด overlay เมื่อ FAB (×) กด formOpen: false
        if (route.params?.formOpen === false && isFlipped) {
            setIsFlipped(false);
        }
    }, [route.params?.flip, route.params?.formOpen]);

    // Sync formOpen state back to route params so FloatingTabBar can read it
    useEffect(() => {
        tabNavigation.setParams({ formOpen: isFlipped });
    }, [isFlipped]);

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

    const closeSearch = () => {
        setSearchOpen(false);
        setQuery('');
        setCalendarStart(selected);
    };

    const headerMonth = mode === 'list' ? monthStartOf(selected) : visibleMonth;
    const [headerYear, headerMonthNumber] = headerMonth.split('-').map(Number);

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
            selectedDayTextColor: palette.raelynn,
            textDayFontWeight: '500',
            textDayHeaderFontWeight: '500',
            weekVerticalMargin: 2,
        }),
        [colors],
    );

    const dayTasks = useMemo(
        () => sortByStart(tasksByDate[selected] ?? []),
        [tasksByDate, selected],
    );
    const doneCount = dayTasks.filter(t => t.done).length;

    const visible = useMemo(
        () =>
            searching
                ? sortByDateTime(filterTasks(allTasks, { status: statusFilter, query: debouncedQuery }))
                : filterTasks(dayTasks, { status: statusFilter, query: '' }),
        [searching, allTasks, dayTasks, statusFilter, debouncedQuery],
    );

    const title = searching
        ? 'Search results'
        : selected === today
            ? "Today's Tasks"
            : formatDate(selected);
    const subtitle = searching
        ? `${visible.length} ${visible.length === 1 ? 'task' : 'tasks'} found`
        : dayTasks.length
            ? `${dayTasks.length} ${dayTasks.length === 1 ? 'task' : 'tasks'} · ${doneCount} done`
            : 'Nothing planned';

    const renderEmpty = () => {
        if (searching) {
            return (
                <EmptyState
                    icon="search-outline"
                    title="No matches"
                    message={`Nothing found for "${query.trim()}"`}
                />
            );
        }
        if (allTasks.length === 0) {
            return (
                <EmptyState
                    icon="clipboard-outline"
                    title="No tasks yet"
                    message="Tap + to add your first task."
                />
            );
        }
        if (dayTasks.length === 0) {
            return (
                <EmptyState
                    icon="calendar-clear-outline"
                    title="Nothing planned"
                    message="No tasks on this day."
                />
            );
        }
        return (
            <EmptyState
                icon="funnel-outline"
                title={statusFilter === 'done' ? 'No completed tasks' : 'No active tasks'}
                message="Try a different filter."
                actionLabel="Show all"
                onAction={() => setStatusFilter('all')}
            />
        );
    };

    return (
        <View style={[styles.root, { backgroundColor: palette.raelynn }]}>
            {searchOpen ? (
                <SearchBar value={query} onChangeText={setQuery} onClose={closeSearch} />
            ) : (
                <View style={[styles.headerRow, { paddingTop: insets.top + spacing.md }]}>
                    <View>
                        <Text style={[styles.monthText, { color: colors.text }]}>
                            {monthNames[headerMonthNumber - 1]}
                        </Text>
                        <Text style={[styles.yearText, { color: colors.textMuted }]}>{headerYear}</Text>
                    </View>

                    <View style={styles.headerActions}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Search tasks"
                            onPress={() => setSearchOpen(true)}
                            style={[styles.iconButton, { backgroundColor: colors.surface }]}>
                            <Ionicons name="search-outline" size={20} color={colors.text} />
                        </Pressable>
                        <IconSegmentedControl
                            options={VIEW_OPTIONS}
                            value={mode}
                            onChange={handleModeChange}
                        />
                    </View>
                </View>
            )}

            {searchOpen ? null : (
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
                        <WeekStrip
                            selected={selected}
                            today={today}
                            dots={dotsByDate}
                            onSelect={setSelected}
                        />
                    )}
                </View>
            )}

            <NotebookCardFront title={title} subtitle={subtitle} style={styles.note}>
                {error ? (
                    <StatusBanner title={error} actionLabel="OK" onAction={clearError} />
                ) : null}
                {storeStatus === 'loading' || storeStatus === 'idle' ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, alignSelf: 'center' }} />
                ) : (
                    <>
                        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            contentContainerStyle={{ paddingBottom: spacing.md }}>
                            {visible.length === 0
                                ? renderEmpty()
                                : visible.map((t, i) => (
                                    <React.Fragment key={t.id}>
                                        {searching && (i === 0 || visible[i - 1].date !== t.date) ? (
                                            <Text style={[styles.dateHeading, { color: colors.textMuted }]}>
                                                {formatDate(t.date)}
                                            </Text>
                                        ) : null}
                                        <AgendaItem
                                            task={t}
                                            done={t.done}
                                            onToggle={() => toggleDone(t.id)}
                                            onToggleSubtask={subtaskId => toggleSubtask(t.id, subtaskId)}
                                            onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                                        />
                                    </React.Fragment>
                                ))}
                        </ScrollView>
                    </>
                )}
            </NotebookCardFront>
            <AddTaskOverlay
                isVisible={isFlipped}
                onClose={() => setIsFlipped(false)}
                initialDate={selected}
            />
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
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthText: { fontSize: fontSize.display - 4, fontWeight: '700' },
    yearText: { fontSize: fontSize.body, marginTop: -2 },
    calendarArea: { overflow: 'hidden' },
    calendarPage: { paddingHorizontal: spacing.sm },
    note: { flex: 1, marginHorizontal: spacing.lg, marginBottom: TAB_BAR_CLEARANCE },
    dateHeading: {
        fontSize: fontSize.caption + 1,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
});

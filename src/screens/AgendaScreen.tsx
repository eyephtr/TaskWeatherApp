import React, { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, spacing } from '../theme/tokens';
import AgendaItem from '../components/AgendaItem';
import { TAB_BAR_CLEARANCE } from '../components/FloatingTabBar';
import { buildMockTasks, type MockTask } from '../mock/mockTasks';
import { formatDate, toDateString } from '../utils/date';

interface DaySection {
    title: string;
    data: MockTask[];
}

export default function AgendaScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // สถานะติ๊กชั่วคราวสำหรับ UI (แยกจากหน้า Tasks จนกว่าจะมี store กลาง)
    const [doneOverrides, setDoneOverrides] = useState<Record<string, boolean>>({});
    const isDone = (t: MockTask) => doneOverrides[t.id] ?? !!t.done;
    const toggleDone = (t: MockTask) =>
        setDoneOverrides(prev => ({ ...prev, [t.id]: !(prev[t.id] ?? !!t.done) }));

    const sections = useMemo<DaySection[]>(() => {
        const now = new Date();
        const today = toDateString(now);
        const tomorrow = toDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
        return Object.entries(buildMockTasks())
            .filter(([date]) => date >= today)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, list]) => ({
                title: date === today ? 'Today' : date === tomorrow ? 'Tomorrow' : formatDate(date),
                data: [...list].sort((a, b) => a.start.localeCompare(b.start)),
            }));
    }, []);

    const total = sections.reduce((sum, s) => sum + s.data.length, 0);

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            <SectionList
                sections={sections}
                keyExtractor={t => t.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + spacing.md,
                    paddingHorizontal: spacing.lg,
                    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
                }}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Agenda</Text>
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                            {total} upcoming {total === 1 ? 'task' : 'tasks'}
                        </Text>
                    </View>
                }
                renderSectionHeader={({ section }) => (
                    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <AgendaItem
                        task={item}
                        done={isDone(item)}
                        onToggle={() => toggleDone(item)}
                        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
                    />
                )}
                ListEmptyComponent={
                    <Text style={[styles.empty, { color: colors.textMuted }]}>Nothing planned</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: { paddingBottom: spacing.md },
    title: { fontSize: fontSize.display - 4, fontWeight: '700' },
    subtitle: { fontSize: fontSize.body, marginTop: -2 },
    sectionHeader: { paddingVertical: spacing.sm },
    sectionTitle: { fontSize: fontSize.body + 2, fontWeight: '700' },
    empty: { textAlign: 'center', paddingVertical: spacing.xl, fontSize: fontSize.body },
});
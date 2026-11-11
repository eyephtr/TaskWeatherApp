import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../theme/tokens';

import { addDays, dayNames, diffDays, startOfWeek } from '../utils/date';

export const WEEK_STRIP_HEIGHT = 84;
const WEEK_RANGE = 52; // เลื่อนได้ย้อนหลังและล่วงหน้าอย่างละ 52 สัปดาห์
const PAGE_PADDING = spacing.sm + 5; // ให้ตรงกับขอบของปฏิทินรายเดือน

interface Props {
    selected: string; // 'YYYY-MM-DD'
    today: string;
    /** สีจุดใต้วันที่ (วันละไม่เกิน 3 จุด) */
    dots: Record<string, string[]>;
    onSelect: (date: string) => void;
}

export default function WeekStrip({ selected, today, dots, onSelect }: Props) {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();

    const weeks = useMemo(() => {
        const anchor = startOfWeek(today);
        return Array.from({ length: WEEK_RANGE * 2 + 1 }, (_, i) => addDays(anchor, (i - WEEK_RANGE) * 7));
    }, [today]);

    // เริ่มที่สัปดาห์ของวันที่เลือก (ใช้ค่าครั้งแรกครั้งเดียว)
    const [initialIndex] = useState(() => {
        const idx = weeks.indexOf(startOfWeek(selected));
        return idx >= 0 ? idx : WEEK_RANGE;
    });

    // ปัดไปสัปดาห์ใหม่แล้วเลือก "วันเดียวกันของสัปดาห์" ให้อัตโนมัติ
    const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        const weekStart = weeks[index];
        if (!weekStart) {
            return;
        }
        const weekday = diffDays(startOfWeek(selected), selected);
        const next = addDays(weekStart, weekday);
        if (next !== selected) {
            onSelect(next);
        }
    };

    const renderWeek = ({ item: weekStart }: { item: string }) => (
        <View style={[styles.page, { width }]}>
            {dayNames.map((name, i) => {
                const date = addDays(weekStart, i);
                const isSelected = date === selected;
                const isToday = date === today;
                const dayDots = dots[date] ?? [];
                return (
                    <Pressable
                        key={date}
                        accessibilityRole="button"
                        accessibilityLabel={date}
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => onSelect(date)}
                        style={styles.cell}>
                        <Text style={[styles.weekday, { color: colors.textMuted }]}>{name.slice(0, 3)}</Text>
                        <View style={[styles.dayCircle, isSelected && { backgroundColor: colors.text }]}>
                            <Text
                                style={[
                                    styles.dayText,
                                    {
                                        color: isSelected
                                            ? colors.background
                                            : isToday
                                                ? colors.primary
                                                : colors.text,
                                    },
                                ]}>
                                {Number(date.slice(8, 10))}
                            </Text>
                        </View>
                        <View style={styles.dots}>
                            {dayDots.map((color, k) => (
                                <View key={k} style={[styles.dot, { backgroundColor: color }]} />
                            ))}
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );

    return (
        <FlatList
            horizontal
            pagingEnabled
            data={weeks}
            extraData={selected}
            keyExtractor={w => w}
            renderItem={renderWeek}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            windowSize={5}
        />
    );
}

const styles = StyleSheet.create({
    page: { flexDirection: 'row', paddingHorizontal: PAGE_PADDING },
    cell: { flex: 1, alignItems: 'center', gap: 4, paddingTop: spacing.sm },
    weekday: { fontSize: fontSize.caption },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayText: { fontSize: fontSize.body, fontWeight: '500' },
    dots: { flexDirection: 'row', gap: 3, height: 6 },
    dot: { width: 5, height: 5, borderRadius: radius.pill },
});
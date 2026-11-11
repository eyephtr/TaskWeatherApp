import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import type { DailyForecast } from '../../types/weather';

import { useTheme } from '../../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../../theme/tokens';

import { describeWeather } from '../../services/weatherCodes';
import { weekdayShort } from '../../utils/date';

const RAIN_CHANCE_SHOWN = 30; // แสดงโอกาสฝนเมื่อตั้งแต่ 30% ขึ้นไป

interface Props {
    days: DailyForecast[];
    today: string;
}

export default function ForecastCard({ days, today }: Props) {
    const { colors } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>Forecast</Text>
            {days.map((day, i) => {
                const { label, icon } = describeWeather(day.weatherCode, true);
                const showRain = day.precipitationProbability >= RAIN_CHANCE_SHOWN;
                return (
                    <View
                        key={day.date}
                        accessible
                        accessibilityLabel={`${day.date === today ? 'Today' : weekdayShort(day.date)}, ${label}, high ${Math.round(day.tempMax)}, low ${Math.round(day.tempMin)}`}
                        style={[
                            styles.row,
                            i < days.length - 1 && {
                                borderBottomColor: colors.border,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            },
                        ]}>
                        <Text style={[styles.day, { color: colors.text }]}>
                            {day.date === today ? 'Today' : weekdayShort(day.date)}
                        </Text>
                        <Ionicons name={icon} size={24} color={colors.text} />
                        <View style={styles.rain}>
                            {showRain ? (
                                <>
                                    <Ionicons name="water-outline" size={14} color={colors.textMuted} />
                                    <Text style={[styles.rainText, { color: colors.textMuted }]}>
                                        {Math.round(day.precipitationProbability)}%
                                    </Text>
                                </>
                            ) : null}
                        </View>
                        <Text style={[styles.temp, { color: colors.text }]}>{Math.round(day.tempMax)}°</Text>
                        <Text style={[styles.temp, { color: colors.textMuted }]}>{Math.round(day.tempMin)}°</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    title: { fontSize: fontSize.body, fontWeight: '700', paddingVertical: spacing.md },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
    },
    day: { width: 52, fontSize: fontSize.body, fontWeight: '500' },
    rain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 },
    rainText: { fontSize: fontSize.caption + 1 },
    temp: { width: 36, textAlign: 'right', fontSize: fontSize.body, fontWeight: '600' },
});
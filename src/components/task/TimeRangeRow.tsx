import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { useTheme } from '../../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../../theme/tokens';

import { addMinutes, fromTimeString, toTimeString } from '../../utils/date';

interface Props {
    start: string;
    end: string | null;
    onChangeStart: (value: string) => void;
    onChangeEnd: (value: string | null) => void;
}

export default function TimeRangeRow({ start, end, onChangeStart, onChangeEnd }: Props) {
    const { colors, isDark } = useTheme();
    const pickerTheme = isDark ? 'dark' : 'light';

    return (
        <View style={styles.row}>
            <View style={styles.col}>
                <Text style={[styles.label, { color: colors.text }]}>Start Time</Text>
                <View style={[styles.box, { backgroundColor: colors.field }]}>
                    <DateTimePicker
                        value={fromTimeString(start)}
                        mode="time"
                        display="compact"
                        themeVariant={pickerTheme}
                        onValueChange={(_, d) => onChangeStart(toTimeString(d))}
                    />
                    <Ionicons name="time-outline" size={20} color={colors.textMuted} />
                </View>
            </View>

            <View style={styles.col}>
                <Text style={[styles.label, { color: colors.text }]}>End Time</Text>
                {end === null ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Add end time"
                        onPress={() => onChangeEnd(addMinutes(start, 60))}
                        style={[styles.box, styles.addBox, { borderColor: colors.border }]}>
                        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                        <Text style={[styles.addText, { color: colors.text }]}>Add end time</Text>
                    </Pressable>
                ) : (
                    <View style={[styles.box, { backgroundColor: colors.field }]}>
                        <DateTimePicker
                            value={fromTimeString(end)}
                            mode="time"
                            display="compact"
                            themeVariant={pickerTheme}
                            onValueChange={(_, d) => onChangeEnd(toTimeString(d))}
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Remove end time"
                            hitSlop={8}
                            onPress={() => onChangeEnd(null)}>
                            <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                        </Pressable>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
    col: { flex: 1, gap: spacing.sm },
    label: { fontSize: fontSize.body - 1, fontWeight: '700' },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
        paddingLeft: spacing.xs,
        paddingRight: spacing.md,
        borderRadius: radius.md,
    },
    addBox: { justifyContent: 'center', gap: spacing.xs, borderWidth: 1, borderStyle: 'dashed' },
    addText: { fontSize: fontSize.body - 2 },
});
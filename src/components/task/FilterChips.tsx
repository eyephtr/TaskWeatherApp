import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../../theme/tokens';

export type ListFilter = 'all' | 'active' | 'done' | 'priority';

const OPTIONS: { key: ListFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'done', label: 'Done' },
    { key: 'priority', label: 'Priority' },
];

export default function FilterChips({ value, onChange }: { value: ListFilter; onChange: (v: ListFilter) => void }) {
    const { colors } = useTheme();
    return (
        <View style={styles.row}>
            {OPTIONS.map(o => {
                const active = o.key === value;
                return (
                    <Pressable
                        key={o.key}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        onPress={() => onChange(o.key)}
                        style={[styles.chip, { backgroundColor: active ? colors.text : colors.surfaceAlt }]}>
                        <Text style={[styles.text, { color: active ? palette.raelynn : colors.text }]}>
                            {o.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, borderRadius: radius.pill },
    text: { fontSize: fontSize.body, fontWeight: '700' },
});
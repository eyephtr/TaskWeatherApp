import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StatusFilter as Status } from '../utils/taskFilters';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';

const OPTIONS: readonly { key: Status; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'done', label: 'Done' },
];

interface Props {
    value: Status;
    onChange: (next: Status) => void;
}

export default function StatusFilter({ value, onChange }: Props) {
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
                        <Text
                            style={[
                                styles.text,
                                { color: active ? palette.raelynn : colors.text },
                            ]}>
                            {o.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md },
    chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill },
    text: { fontSize: fontSize.body - 2, fontWeight: '600' },
});
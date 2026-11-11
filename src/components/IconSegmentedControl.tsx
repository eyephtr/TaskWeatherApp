import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface SegmentOption<T extends string> {
    key: T;
    icon: IconName;
    label: string;
}

interface Props<T extends string> {
    options: readonly SegmentOption<T>[];
    value: T;
    onChange: (key: T) => void;
}

export default function IconSegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
    const { colors } = useTheme();
    return (
        <View style={[styles.track, { backgroundColor: colors.surface }]} accessibilityRole="tablist">
            {options.map(o => {
                const active = o.key === value;
                return (
                    <Pressable
                        key={o.key}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={o.label}
                        onPress={() => onChange(o.key)}
                        style={[styles.segment, active && { backgroundColor: colors.text }]}>
                        <Ionicons name={o.icon} size={20} color={active ? colors.background : colors.text} />
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        flexDirection: 'row',
        padding: spacing.xs,
        borderRadius: radius.pill,
    },
    segment: {
        width: 44,
        height: 36,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
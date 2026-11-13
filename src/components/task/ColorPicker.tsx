import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { useTheme } from '../../theme/ThemeProvider';
import { palette, spacing, TASK_COLORS, TASK_COLOR_KEYS, type TaskColorKey } from '../../theme/tokens';

interface Props {
    value: TaskColorKey;
    onChange: (key: TaskColorKey) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
    const { colors } = useTheme();
    return (
        <View style={styles.row}>
            {TASK_COLOR_KEYS.map(key => {
                const active = key === value;
                return (
                    <Pressable
                        key={key}
                        accessibilityRole="button"
                        accessibilityLabel={`Color ${key}`}
                        accessibilityState={{ selected: active }}
                        onPress={() => onChange(key)}
                        style={[
                            styles.dot,
                            { backgroundColor: TASK_COLORS[key] },
                            active && { borderColor: colors.text },
                        ]}>
                        {active ? <Ionicons name="checkmark" size={18} color={palette.bistre} /> : null}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    dot: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 2,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
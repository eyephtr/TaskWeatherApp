import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeProvider';
import { palette } from '../theme/tokens';

interface Props {
    checked: boolean;
    onPress: () => void;
    label: string;
    size?: number;
}

export default function Check({ checked, onPress, label, size = 28 }: Props) {
    const { colors } = useTheme();
    return (
        <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={label}
            hitSlop={8}
            onPress={onPress}
            style={[
                styles.check,
                { width: size, height: size, borderRadius: size / 2 },
                checked
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: palette.white, borderColor: palette.white },
            ]}>
            {checked ? (
                <Ionicons name="checkmark" size={size * 0.6} color={palette.linenCream} />
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    check: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
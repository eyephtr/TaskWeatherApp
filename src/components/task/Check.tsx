import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '../../theme/ThemeProvider';
import { palette } from '../../theme/tokens';

interface Props {
    checked: boolean;
    onPress: () => void;
    label: string;
    size?: number;
}

export default function Check({ 
    checked, 
    onPress, 
    label, 
    size = 28 
}: Props) {
    const { colors } = useTheme();

    const strokeWidth = 1.5;
    const center = size / 2;
    const radius = center - strokeWidth;

    return (
        <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={label}
            hitSlop={8}
            onPress={onPress}
            style={[
                styles.container,
                { width: size, height: size },
                checked && {
                    backgroundColor: colors.primary,
                    borderRadius: size / 2,
                },
            ]}>
            {!checked ? (
                <Svg width={size} height={size} style={styles.svg}>
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={colors.border}
                        strokeWidth={strokeWidth}
                        strokeDasharray="3, 3"
                        fill={palette.white}
                    />
                </Svg>
            ) : null}

            {checked ? (
                <Ionicons name="checkmark" size={size * 0.6} color={palette.linenCream} />
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: { 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    svg: { 
        position: 'absolute', 
    },
});
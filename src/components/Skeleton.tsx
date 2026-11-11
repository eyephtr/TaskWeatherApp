import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    View,
    type DimensionValue,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../theme/tokens';

interface GroupProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function Skeleton({ children, style }: GroupProps) {
    const opacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [opacity]);

    return (
        <Animated.View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Loading weather"
            style={[style, { opacity }]}>
            {children}
        </Animated.View>
    );
}

interface BlockProps {
    width?: DimensionValue;
    height: number;
    rounded?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export function SkeletonBlock({ width = '100%', height, rounded = radius.sm, color, style }: BlockProps) {
    const { colors } = useTheme();
    return (
        <View
            style={[
                styles.block,
                { width, height, borderRadius: rounded, backgroundColor: color ?? colors.border },
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    block: {},
});
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useTheme } from '../../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../../theme/tokens';

export const TAB_BAR_CLEARANCE = 105;

const BAR_HEIGHT = 64;
const PLUS_SIZE = 20;
const PLUS_THICKNESS = 3;

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const isTasksTab = state.routes[state.index]?.name === 'Tasks';
    const tasksRoute = state.routes.find(r => r.name === 'Tasks');
    const isFormOpen = isTasksTab && (tasksRoute?.params as { formOpen?: boolean } | undefined)?.formOpen === true;

    const animValue = useRef(new Animated.Value(isTasksTab ? 1 : 0)).current;
    useEffect(() => {
        Animated.spring(animValue, {
            toValue: isTasksTab ? 1 : 0,
            useNativeDriver: false,
        }).start();
    }, [isTasksTab, animValue]);

    const formAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.spring(formAnim, {
            toValue: isFormOpen ? 1 : 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 120,
        }).start();
    }, [isFormOpen, formAnim]);

    const barMargin = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [spacing.xl * 3, 0],
    });
    const barStyle = {
        marginHorizontal: barMargin,
        flex: 1,
    };

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.wrap,
                { bottom: Math.max(insets.bottom - spacing.md, spacing.sm) },
                {
                    transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }) }],
                    opacity: formAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                },
            ]}>
            <Animated.View style={[styles.bar, { backgroundColor: palette.bistre, borderColor: palette.bistre }, barStyle]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const focused = state.index === index;
                    const tint = focused ? palette.raelynn : palette.linenCream;
                    const label =
                        typeof options.tabBarLabel === 'string'
                            ? options.tabBarLabel
                            : options.title ?? route.name;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!focused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: focused }}
                            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                            onPress={onPress}
                            style={styles.pressable}>
                            <View style={[styles.item, focused && { backgroundColor: colors.accentSoft }]}>
                                {options.tabBarIcon?.({ focused, color: tint, size: 22 })}
                                <Text style={[styles.label, { color: tint }, focused && styles.labelActive]}>
                                    {label}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </Animated.View>

            {isTasksTab ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isFormOpen ? 'Close' : 'Add task'}
                    onPress={() => {
                        if (isFormOpen) {
                            // close: setParams formOpen=false via Tasks tab
                            navigation.navigate('Tasks', { formOpen: false });
                        } else {
                            navigation.navigate('Tasks', { flip: Date.now() });
                        }
                    }}
                    style={[styles.fab, { backgroundColor: isFormOpen ? colors.text : colors.primary }]}>
                    <View style={styles.plus}>
                        {isFormOpen ? (
                            // × icon
                            <>
                                <View style={[styles.plusBar, styles.plusDiag1, { backgroundColor: palette.linenCream }]} />
                                <View style={[styles.plusBar, styles.plusDiag2, { backgroundColor: palette.linenCream }]} />
                            </>
                        ) : (
                            // + icon
                            <>
                                <View style={[styles.plusBar, styles.plusHorizontal, { backgroundColor: palette.linenCream }]} />
                                <View style={[styles.plusBar, styles.plusVertical, { backgroundColor: palette.linenCream }]} />
                            </>
                        )}
                    </View>
                </Pressable>
            ) : null}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    bar: {
        flexDirection: 'row',
        height: BAR_HEIGHT,
        paddingVertical: spacing.xs + 2,
        paddingHorizontal: spacing.xs + 2,
        borderRadius: radius.pill,
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: palette.bistre,
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    pressable: { flex: 1 },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        borderRadius: radius.pill,
    },
    label: { fontSize: fontSize.caption - 1 },
    labelActive: { fontWeight: '700' },
    fab: {
        width: BAR_HEIGHT,
        height: BAR_HEIGHT,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: palette.bistre,
        shadowOpacity: 0.18,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    plus: {
        width: PLUS_SIZE,
        height: PLUS_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusBar: { position: 'absolute', borderRadius: PLUS_THICKNESS / 2 },
    plusHorizontal: { width: PLUS_SIZE, height: PLUS_THICKNESS },
    plusVertical: { width: PLUS_THICKNESS, height: PLUS_SIZE },
    plusDiag1: { width: PLUS_SIZE, height: PLUS_THICKNESS, transform: [{ rotate: '45deg' }] },
    plusDiag2: { width: PLUS_SIZE, height: PLUS_THICKNESS, transform: [{ rotate: '-45deg' }] },
});

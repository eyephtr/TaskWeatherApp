import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';

export const TAB_BAR_CLEARANCE = 100;

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            pointerEvents="box-none"
            style={[styles.wrap, { bottom: Math.max(insets.bottom - spacing.md, spacing.sm) }]}>
            <View style={[styles.bar, { backgroundColor: palette.bistre, borderColor: palette.bistre }]}>
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
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg },
    bar: {
        flexDirection: 'row',
        padding: spacing.xs + 2,
        borderRadius: radius.pill,
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: palette.bistre,
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    pressable: { flex: 1 },
    item: {
        alignItems: 'center',
        gap: 2,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
    },
    label: { fontSize: fontSize.caption - 1 },
    labelActive: { fontWeight: '700' },
});
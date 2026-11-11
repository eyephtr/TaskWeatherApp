import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../../theme/tokens';

export const HEADER_BUTTON_SIZE = 44;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function HeaderButton({
    icon,
    label,
    onPress,
}: {
    icon: IconName;
    label: string;
    onPress: () => void;
}) {
    const { colors } = useTheme();
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={8}
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
            ]}>
            <Ionicons name={icon} size={22} color={colors.text} />
        </Pressable>
    );
}

interface Props {
    title?: string;
    variant?: 'back' | 'close';
    right?: React.ReactNode;
}

export default function ScreenHeader({ title, variant = 'back', right }: Props) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    return (
        <View
            style={[
                styles.row,
                {
                    paddingTop:
                        variant === 'close' ? spacing.lg : Math.max(insets.top, spacing.md) + spacing.sm,
                },
            ]}>
            <HeaderButton
                icon={variant === 'back' ? 'chevron-back' : 'close'}
                label={variant === 'back' ? 'Go back' : 'Close'}
                onPress={navigation.goBack}
            />

            <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
                {title ?? ''}
            </Text>

            {right ?? <View style={styles.spacer} />}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    button: {
        width: HEADER_BUTTON_SIZE,
        height: HEADER_BUTTON_SIZE,
        borderRadius: radius.pill,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: { opacity: 0.6 },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: fontSize.body + 2,
        fontWeight: '700',
    },
    spacer: { width: HEADER_BUTTON_SIZE },
});
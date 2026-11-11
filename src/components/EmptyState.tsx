import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, spacing } from '../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
    icon: IconName;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
    const { colors } = useTheme();
    return (
        <View style={styles.wrap}>
            <Ionicons name={icon} size={40} color={colors.textMuted} />
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
            {actionLabel && onAction ? (
                <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
                    <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
    title: { fontSize: fontSize.body, fontWeight: '700' },
    message: { fontSize: fontSize.body - 2, textAlign: 'center' },
    action: { fontSize: fontSize.body, fontWeight: '600', marginTop: spacing.xs },
});
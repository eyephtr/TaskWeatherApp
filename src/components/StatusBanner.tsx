import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../theme/tokens';

interface Props {
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function StatusBanner({ title, message, actionLabel, onAction }: Props) {
    const { colors } = useTheme();
    return (
        <View
            accessibilityRole="alert"
            style={[styles.wrap, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="alert-circle" size={22} color={colors.danger} />
            <View style={styles.texts}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
            </View>
            {actionLabel && onAction ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onAction}
                    hitSlop={8}
                    style={[styles.action, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.actionText, { color: colors.onPrimary }]}>{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
    },
    texts: { flex: 1, gap: 2 },
    title: { fontSize: fontSize.body - 1, fontWeight: '700' },
    message: { fontSize: fontSize.caption + 1 },
    action: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
    actionText: { fontSize: fontSize.body - 2, fontWeight: '700' },
});
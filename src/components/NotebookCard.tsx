import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';

interface Props {
    title: string;
    subtitle?: string;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export default function NotebookCard({ title, subtitle, style, children }: Props) {
    const { colors } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: colors.surface }, style]}>
            <View style={styles.rings} pointerEvents="none">
                {Array.from({ length: 5 }).map((_, i) => (
                    <View key={i} style={[styles.ring, { backgroundColor: colors.ring }]} />
                ))}
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle ? (
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
            ) : null}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: radius.lg,
        paddingTop: spacing.xl + spacing.md,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        shadowColor: palette.bistre,
        shadowOpacity: 0.2,
        shadowOffset: { width: 4, height: 4 },
        elevation: 6,
    },
    rings: {
        position: 'absolute',
        top: -10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl + spacing.md,
    },
    ring: {
        width: 15,
        height: 30,
        borderBottomLeftRadius: 6,
        borderTopLeftRadius: 6,
        borderBottomRightRadius: 6,
        borderTopRightRadius: 6
    },
    title: { fontSize: fontSize.body + 2, fontWeight: '700', textAlign: 'center' },
    subtitle: {
        fontSize: fontSize.caption + 1,
        textAlign: 'center',
        marginTop: spacing.xs,
        marginBottom: spacing.md,
    },
});
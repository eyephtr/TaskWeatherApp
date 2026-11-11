import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing } from '../theme/tokens';

import { Skeleton, SkeletonBlock } from './Skeleton';

export default function WeatherSkeleton() {
    const { colors } = useTheme();
    const onCard = `${colors.onWeatherCard}26`;

    return (
        <Skeleton style={styles.group}>
            <View style={[styles.hero, { backgroundColor: colors.weatherCard }]}>
                <SkeletonBlock width={110} height={16} color={onCard} />
                <View style={styles.heroRow}>
                    <SkeletonBlock width={120} height={64} rounded={16} color={onCard} />
                    <SkeletonBlock width={72} height={72} rounded={36} color={onCard} />
                </View>
                <SkeletonBlock width={160} height={20} color={onCard} />
                <SkeletonBlock width={120} height={14} color={onCard} />
            </View>

            <View style={[styles.list, { backgroundColor: colors.surface }]}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <View key={i} style={styles.row}>
                        <SkeletonBlock width={48} height={16} />
                        <SkeletonBlock width={24} height={24} rounded={12} />
                        <SkeletonBlock width={72} height={16} />
                    </View>
                ))}
            </View>
        </Skeleton>
    );
}

const styles = StyleSheet.create({
    group: { gap: spacing.md },
    hero: { borderRadius: 28, padding: spacing.lg, gap: spacing.md },
    heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    list: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.lg },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
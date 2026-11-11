import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';

import { useWeatherStore } from '../store/useWeatherStore';

import CurrentWeatherCard from '../components/CurrentWeatherCard';
import ForecastCard from '../components/ForecastCard';
import StatusBanner from '../components/StatusBanner';
import WeatherSkeleton from '../components/WeatherSkeleton';
import { TAB_BAR_CLEARANCE } from '../components/FloatingTabBar';

import { toDateString } from '../utils/date';
import { formatUpdatedAgo } from '../utils/time';

const CLOCK_TICK_MS = 30000;

export default function WeatherScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const status = useWeatherStore(s => s.status);
    const data = useWeatherStore(s => s.data);
    const location = useWeatherStore(s => s.location);
    const isRefreshing = useWeatherStore(s => s.isRefreshing);
    const isStale = useWeatherStore(s => s.isStale);
    const errorMessage = useWeatherStore(s => s.errorMessage);
    const load = useWeatherStore(s => s.load);

    const [now, setNow] = useState(() => Date.now());
    const [pulling, setPulling] = useState(false);

    // เปิดหน้านี้ทีไรก็เช็กข้อมูล (ถ้า cache ยังไม่เกิน 10 นาทีจะไม่ยิง API)
    useFocusEffect(
        useCallback(() => {
            setNow(Date.now());
            load();
        }, [load]),
    );

    // อัปเดตข้อความ "Updated X min ago" เป็นระยะ
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
        return () => clearInterval(id);
    }, []);

    const handleRefresh = async () => {
        setPulling(true);
        try {
            await load();
        } finally {
            setPulling(false);
            setNow(Date.now());
        }
    };

    const subtitle = data
        ? isRefreshing
            ? 'Refreshing…'
            : formatUpdatedAgo(data.fetchedAt, now)
        : location.name;

    return (
        <View style={[styles.root, { backgroundColor: palette.peachPuff }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + spacing.md,
                    paddingHorizontal: spacing.lg,
                    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
                    gap: spacing.md,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={pulling}
                        onRefresh={handleRefresh}
                        tintColor={colors.text}
                    />
                }>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Weather</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
                </View>

                {data ? (
                    <>
                        {isStale ? (
                            <StatusBanner
                                title="Showing saved data"
                                message={errorMessage ?? undefined}
                                actionLabel="Retry"
                                onAction={load}
                            />
                        ) : null}
                        <CurrentWeatherCard data={data} />
                        <ForecastCard days={data.daily} today={toDateString(new Date(now))} />
                    </>
                ) : status === 'error' ? (
                    <View style={[styles.errorCard, { backgroundColor: colors.surface }]}>
                        <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
                        <Text style={[styles.errorTitle, { color: colors.text }]}>
                            Couldn&apos;t load the weather
                        </Text>
                        <Text style={[styles.errorMessage, { color: colors.textMuted }]}>
                            {errorMessage}
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => load()}
                            style={[styles.retry, { backgroundColor: colors.primary }]}>
                            <Ionicons name="refresh" size={18} color={colors.onPrimary} />
                            <Text style={[styles.retryText, { color: colors.onPrimary }]}>Try again</Text>
                        </Pressable>
                    </View>
                ) : (
                    <WeatherSkeleton />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    title: { fontSize: fontSize.display - 4, fontWeight: '700' },
    subtitle: { fontSize: fontSize.body, marginTop: 2 },
    errorCard: {
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.xl,
        borderRadius: radius.lg,
    },
    errorTitle: { fontSize: fontSize.title - 2, fontWeight: '700', textAlign: 'center' },
    errorMessage: { fontSize: fontSize.body - 1, textAlign: 'center' },
    retry: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
    },
    retryText: { fontSize: fontSize.body, fontWeight: '700' },
});
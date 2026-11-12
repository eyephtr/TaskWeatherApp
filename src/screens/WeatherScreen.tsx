import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../theme/tokens';

import { useWeatherStore } from '../store/useWeatherStore';

import CurrentWeatherCard, { Wave } from '../components/weather/CurrentWeatherCard';
import ForecastCard from '../components/weather/ForecastCard';
import StatusBanner from '../components/common/StatusBanner';
import WeatherSkeleton from '../components/weather/WeatherSkeleton';
import { TAB_BAR_CLEARANCE } from '../components/common/FloatingTabBar';

import { toDateString } from '../utils/date';
import { formatUpdatedAgo } from '../utils/time';

const CLOCK_TICK_MS = 30000;
const WAVE_OVERLAP = 64;

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
    const [heroHeight, setHeroHeight] = useState(0);

    // เพิ่ม Animated.Value สำหรับเก็บระยะการเลื่อนแนวตั้ง
    const scrollY = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            setNow(Date.now());
            load();
        }, [load]),
    );

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

    const topPadding = { paddingTop: insets.top + spacing.md };

    return (
        <View style={[styles.root, { backgroundColor: colors.surface }]}>
            {data ? (
                <>
                    {/* ส่วนบน: ส่ง scrollY เข้าไป */}
                    <View style={styles.hero} onLayout={e => setHeroHeight(e.nativeEvent.layout.height)}>
                        <CurrentWeatherCard data={data} subtitle={subtitle} now={now} scrollY={scrollY} />
                    </View>

                    {/* ส่วนล่าง: เปลี่ยนเป็น Animated.ScrollView */}
                    <Animated.ScrollView
                        style={StyleSheet.absoluteFill}
                        showsVerticalScrollIndicator={false}
                        bounces
                        scrollEventThrottle={16}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            { useNativeDriver: true },
                        )}
                        contentContainerStyle={{ paddingTop: Math.max(heroHeight - WAVE_OVERLAP, 0) }}
                        refreshControl={
                            <RefreshControl
                                refreshing={pulling}
                                onRefresh={handleRefresh}
                                tintColor={colors.text}
                                progressViewOffset={insets.top}
                            />
                        }>
                        <View>
                            <Wave color={colors.surface} />
                            <View
                                style={[
                                    styles.sheet,
                                    { backgroundColor: colors.surface, paddingBottom: TAB_BAR_CLEARANCE + spacing.lg },
                                ]}>
                                {isStale ? (
                                    <StatusBanner
                                        title="Showing saved data"
                                        message={errorMessage ?? undefined}
                                        actionLabel="Retry"
                                        onAction={load}
                                    />
                                ) : null}
                                <ForecastCard days={data.daily} today={toDateString(new Date(now))} />
                            </View>
                        </View>
                    </Animated.ScrollView>
                </>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.body,
                        topPadding,
                        { paddingBottom: TAB_BAR_CLEARANCE + spacing.lg },
                    ]}
                    refreshControl={
                        <RefreshControl refreshing={pulling} onRefresh={handleRefresh} tintColor={colors.text} />
                    }>
                    {status === 'error' ? (
                        <View style={[styles.errorCard, { backgroundColor: colors.surfaceAlt }]}>
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
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    body: { paddingHorizontal: spacing.lg, gap: spacing.md },
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
    hero: { position: 'absolute', top: 0, left: 0, right: 0 },
    sheet: { paddingHorizontal: spacing.lg },
});
import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { WeatherData } from '../../types/weather';

import { fontSize, palette, spacing } from '../../theme/tokens';

import { describeWeather } from '../../services/weatherCodes';

import WeatherIllustration from './WeatherIllustration';

export const COLD_BELOW_C = 27;
const ILLUSTRATION_SIZE = 350;

export const heroColor = (temperature: number) =>
    temperature < COLD_BELOW_C ? palette.subtlePurple : palette.matteCoral;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function Stat({ icon, value, label, ink }: { icon: IconName; value: string; label: string; ink: string }) {
    return (
        <View style={styles.stat}>
            <Ionicons name={icon} size={20} color={ink} />
            <Text style={[styles.statValue, { color: ink }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: ink }]}>{label}</Text>
        </View>
    );
}

export function Wave({ color }: { color: string }) {
    return (
        <Svg style={styles.wave} height={64} viewBox="0 0 400 64" preserveAspectRatio="none">
            <Path
                d="M0 22 C90 52 170 4 260 28 S360 48 400 18 L400 64 L0 64 Z"
                fill={color}
                opacity={0.5}
            />
            <Path d="M0 40 C80 12 160 58 240 34 S360 16 400 40 L400 64 L0 64 Z" fill={color} />
        </Svg>
    );
}

interface Props {
    data: WeatherData;
    subtitle: string;
    now: number;
    scrollY?: Animated.Value;
}

export default function CurrentWeatherCard({ data, subtitle, now, scrollY }: Props) {
    const insets = useSafeAreaInsets();
    const { current, location } = data;
    const { label, icon: weatherIcon } = describeWeather(current.weatherCode, current.isDay);
    const icon = current.isDay ? weatherIcon : 'moon';

    const bg = heroColor(current.temperature);
    const ink = palette.bistre;

    const illustrationTranslateX = scrollY
        ? scrollY.interpolate({
            inputRange: [0, 260],
            outputRange: [0, 80],
            extrapolate: 'clamp',
        })
        : 0;

    const illustrationTranslateY = scrollY
        ? scrollY.interpolate({
            inputRange: [0, 260],
            outputRange: [0, -80],
            extrapolate: 'clamp',
        })
        : 0;

    return (
        <View style={{ backgroundColor: bg, paddingTop: insets.top + spacing.md }}>
            <View style={styles.content}>
                <View style={styles.tempRow}>
                    <Text style={[styles.temp, { color: ink }]}>{Math.round(current.temperature)}</Text>
                    <Text style={[styles.unit, { color: ink }]}>°C</Text>
                </View>

                <Text style={[styles.location, { color: ink }]}>{location.name}</Text>
                <Text style={[styles.subtitle, { color: ink }]}>{subtitle}</Text>

                <Animated.View
                    style={[
                        styles.illustration,
                        {
                            transform: [
                                { translateX: illustrationTranslateX },
                                { translateY: illustrationTranslateY },
                            ],
                        },
                    ]}>
                    <WeatherIllustration icon={icon} bg={bg} ink={ink} size={ILLUSTRATION_SIZE} />
                </Animated.View>

                <Text style={[styles.day, { color: ink }]}>{WEEKDAYS[new Date(now).getDay()]}</Text>
                <Text style={[styles.condition, { color: ink }]}>
                    {label} · Feels like {Math.round(current.apparentTemperature)}°
                </Text>

                <View style={styles.stats}>
                    <Stat icon="water-outline" value={`${Math.round(current.humidity)}%`} label="Humidity" ink={ink} />
                    <Stat
                        icon="speedometer-outline"
                        value={`${Math.round(current.windSpeed)} km/h`}
                        label="Wind"
                        ink={ink}
                    />
                    <Stat icon="rainy-outline" value={`${current.precipitation} mm`} label="Rain" ink={ink} />
                </View>
            </View>

            <View style={styles.waveSpace} />
        </View>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: spacing.lg },
    location: { fontSize: fontSize.title, fontWeight: '600' },
    subtitle: { fontSize: fontSize.caption + 1, opacity: 0.7, marginTop: 2 },
    tempRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.sm },
    temp: { fontSize: 96, lineHeight: 104, fontWeight: '700' },
    unit: { fontSize: fontSize.title, marginBottom: 18, marginLeft: 4 },
    range: { marginLeft: spacing.lg, marginBottom: 16, gap: spacing.sm },
    rangeItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    rangeText: { fontSize: fontSize.body, fontWeight: '700' },
    illustration: { alignItems: 'center', marginVertical: -spacing.xl },
    day: { fontSize: fontSize.title, textAlign: 'center', fontWeight: '600' },
    condition: { fontSize: fontSize.body, textAlign: 'center', opacity: 0.8, marginTop: 2 },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    waveSpace: { height: 80 },
    stat: { alignItems: 'center', gap: 2 },
    statValue: { fontSize: fontSize.body, fontWeight: '700' },
    statLabel: { fontSize: fontSize.caption },
    wave: { width: '100%' },
});
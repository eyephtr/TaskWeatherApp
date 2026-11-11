import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import type { WeatherData } from '../../types/weather';

import { useTheme } from '../../theme/ThemeProvider';
import { fontSize, spacing } from '../../theme/tokens';

import { describeWeather } from '../../services/weatherCodes';

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

export default function CurrentWeatherCard({ data }: { data: WeatherData }) {
    const { colors } = useTheme();
    const { current, location } = data;
    const { label, icon } = describeWeather(current.weatherCode, current.isDay);
    const ink = colors.onWeatherCard;

    return (
        <View style={[styles.card, { backgroundColor: colors.weatherCard }]}>
            <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={ink} />
                <Text style={[styles.location, { color: ink }]}>{location.name}</Text>
            </View>

            <View style={styles.mainRow}>
                <Text style={[styles.temp, { color: ink }]}>{Math.round(current.temperature)}°</Text>
                <Ionicons name={icon} size={72} color={ink} />
            </View>

            <Text style={[styles.label, { color: ink }]}>{label}</Text>
            <Text style={[styles.feels, { color: ink }]}>
                Feels like {Math.round(current.apparentTemperature)}°
            </Text>

            <View style={[styles.stats, { borderTopColor: `${ink}33` }]}>
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
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 28, padding: spacing.lg, gap: spacing.xs },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    location: { fontSize: fontSize.body, fontWeight: '600' },
    mainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    temp: { fontSize: 64, fontWeight: '700' },
    label: { fontSize: fontSize.title, fontWeight: '700' },
    feels: { fontSize: fontSize.body },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    stat: { alignItems: 'center', gap: 2 },
    statValue: { fontSize: fontSize.body, fontWeight: '700' },
    statLabel: { fontSize: fontSize.caption },
});
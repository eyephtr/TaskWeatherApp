import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../theme/tokens';

export default function WeatherScreen() {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.card, { backgroundColor: colors.weatherCard }]}>
                <Text style={[styles.title, { color: colors.onWeatherCard }]}>Weather</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    card: { alignSelf: 'stretch', padding: spacing.xl, borderRadius: radius.lg },
    title: { fontSize: fontSize.title, fontWeight: '600' },
});
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WeatherScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Weather</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: '600' },
});
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_CLEARANCE } from '../components/FloatingTabBar';

import { useTheme } from '../theme/ThemeProvider';
import { fontSize, palette, radius, spacing } from '../theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface RowProps {
    icon: IconName;
    label: string;
    right: React.ReactNode;
    last?: boolean;
}

function SettingRow({ icon, label, right, last }: RowProps) {
    const { colors } = useTheme();
    return (
        <View
            style={[
                styles.row,
                !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}>
            <View style={[styles.iconWrap, { backgroundColor: palette.raelynn }]}>
                <Ionicons name={icon} size={18} color={colors.text} />
            </View>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            {right}
        </View>
    );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
    const { colors } = useTheme();
    return (
        <View style={styles.group}>
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>{title}</Text>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>{children}</View>
        </View>
    );
}

export default function SettingsScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    // สถานะชั่วคราวสำหรับ UI
    const [showCompleted, setShowCompleted] = useState(true);
    const [rainAlerts, setRainAlerts] = useState(true);

    const track = { false: colors.border, true: colors.primary };

    return (
        <View style={[styles.root, { backgroundColor: palette.raelynn }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + spacing.md,
                    paddingHorizontal: spacing.lg,
                    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
                }}>
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

                <Group title="Tasks">
                    <SettingRow
                        icon="checkmark-circle-outline"
                        label="Show completed tasks"
                        last
                        right={
                            <Switch value={showCompleted} onValueChange={setShowCompleted} trackColor={track} />
                        }
                    />
                </Group>

                <Group title="Weather">
                    <SettingRow
                        icon="rainy-outline"
                        label="Rain alerts for outdoor tasks"
                        right={<Switch value={rainAlerts} onValueChange={setRainAlerts} trackColor={track} />}
                    />
                    <SettingRow
                        icon="thermometer-outline"
                        label="Temperature unit"
                        last
                        right={<Text style={{ color: colors.textMuted }}>°C</Text>}
                    />
                </Group>

                <Group title="About">
                    <SettingRow
                        icon="information-circle-outline"
                        label="Version"
                        last
                        right={<Text style={{ color: colors.textMuted }}>0.0.1</Text>}
                    />
                </Group>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    title: { fontSize: fontSize.display - 4, fontWeight: '700', marginBottom: spacing.md },
    group: { marginBottom: spacing.lg },
    groupTitle: {
        fontSize: fontSize.caption + 1,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    card: { borderRadius: radius.lg, paddingHorizontal: spacing.lg },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: { flex: 1, fontSize: fontSize.body },
});
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { fontSize, radius, spacing } from '../theme/tokens';

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    onClose: () => void;
}

export default function SearchBar({ value, onChangeText, onClose }: Props) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.row, { paddingTop: insets.top + spacing.md }]}>
            <View style={[styles.field, { backgroundColor: colors.surface }]}>
                <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                <TextInput
                    accessibilityLabel="Search tasks"
                    autoFocus
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="Search title, tag or subtask"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="search"
                    autoCorrect={false}
                    style={[styles.input, { color: colors.text }]}
                />
                {value ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                        hitSlop={8}
                        onPress={() => onChangeText('')}>
                        <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                    </Pressable>
                ) : null}
            </View>
            <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
                <Text style={[styles.cancel, { color: colors.text }]}>Cancel</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    field: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        height: 44,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
    },
    input: { flex: 1, fontSize: fontSize.body, paddingVertical: 0 },
    cancel: { fontSize: fontSize.body, fontWeight: '600' },
});
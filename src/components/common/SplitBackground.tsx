import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';

interface Props {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export default function SplitBackground({ children, style }: Props) {
    const { colors } = useTheme();
    return (
        <View style={[styles.root, { backgroundColor: colors.background }, style]}>
            <View
                pointerEvents="none"
                style={[styles.bottom, { backgroundColor: colors.backgroundDeep }]}
            />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },
});
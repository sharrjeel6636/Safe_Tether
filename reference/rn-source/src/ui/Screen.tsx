// src/ui/Screen.tsx
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, space } from './theme';

interface Props {
  children: ReactNode;
  /** false for screens that manage their own scrolling (a SectionList). */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

/** The common page: sand background, a 16 pt gutter, scrolls when the content is long. */
export function Screen({ children, scroll = true, contentStyle }: Props) {
  if (!scroll) return <View style={[styles.fill, styles.pad, contentStyle]}>{children}</View>;
  return (
    <ScrollView style={styles.fill} contentContainerStyle={[styles.pad, contentStyle]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export const Gap = ({ h = space.m }: { h?: number }) => <View style={{ height: h }} />;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.sand },
  pad: { padding: space.l, paddingBottom: space.xxl },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: space.l,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.m,
  },
});

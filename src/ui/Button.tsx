// src/ui/Button.tsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from './theme';

type Kind = 'primary' | 'outline' | 'danger' | 'text';

interface Props {
  label: string;
  onPress: () => void;
  kind?: Kind;
  disabled?: boolean;
  busy?: boolean;
  /** Smaller button for use inside a row or a card. */
  compact?: boolean;
}

export function Button({ label, onPress, kind = 'primary', disabled = false, busy = false, compact = false }: Props) {
  const off = disabled || busy;
  const filled = kind === 'primary' || kind === 'danger';
  const bg = kind === 'danger' ? colors.coralDark : colors.teal;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy }}
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.base,
        { minHeight: compact ? 44 : 52 },
        filled && { backgroundColor: bg },
        kind === 'outline' && styles.outline,
        kind === 'text' && styles.textOnly,
        off && styles.off,
        pressed && !off && { opacity: 0.85 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={filled ? '#fff' : colors.teal} />
      ) : (
        <Text style={[styles.label, { color: filled ? '#fff' : colors.teal }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 26, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  outline: { borderWidth: 1.5, borderColor: colors.teal, backgroundColor: 'transparent' },
  textOnly: { backgroundColor: 'transparent', minHeight: 44 },
  off: { opacity: 0.45 },
  label: { fontSize: 16, fontWeight: '700' },
});

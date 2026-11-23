// src/components/StatusChip.tsx
import { StyleSheet, Text, View } from 'react-native';
import { LINK_LABEL } from '../domain/types';
import type { LinkState } from '../domain/types';
import { colors } from '../ui/theme';

const colorOf = (s: LinkState): string => {
  switch (s) {
    case 'connected':
      return colors.ok;
    case 'outOfRange':
    case 'connectionLost':
      return colors.coral;
    case 'reconnecting':
    case 'disconnected':
      return colors.warn;
    default:
      return colors.grey;
  }
};

export function LinkChip({ state }: { state: LinkState }) {
  const c = colorOf(state);
  return (
    <View style={[styles.chip, { backgroundColor: `${c}26`, borderColor: c }]}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text style={styles.text}>{LINK_LABEL[state]}</Text>
    </View>
  );
}

export function BatteryLabel({ percent, charging }: { percent: number | null; charging: boolean }) {
  const low = percent !== null && percent <= 20 && !charging;
  return (
    <Text style={[styles.battery, low && { color: colors.coralDark }]}>
      {percent === null ? 'Battery: unknown' : `Battery ${percent} %${charging ? ' (charging)' : ''}`}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  text: { fontSize: 14, fontWeight: '700', color: colors.ink },
  battery: { fontSize: 15, fontWeight: '600', color: colors.ink },
});

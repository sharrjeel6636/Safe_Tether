// src/components/AlertTile.tsx
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMetres, formatTime } from '../core/format';
import { ALERT_TITLE } from '../domain/types';
import type { AlertRow, AlertType } from '../domain/types';
import { Button } from '../ui/Button';
import { colors, space } from '../ui/theme';

const colorOf = (t: AlertType): string => {
  switch (t) {
    case 'panic':
      return colors.coralDark;
    case 'out_of_range':
    case 'connection_lost':
      return colors.coral;
    case 'low_battery':
      return colors.warn;
    default:
      return colors.teal;
  }
};

const letterOf = (t: AlertType): string => (t === 'panic' ? '!' : t === 'out_of_range' ? '↔' : t === 'low_battery' ? '▯' : t === 'buzzer' ? '♪' : '×');

interface Props {
  row: AlertRow;
  onViewMap: (row: AlertRow) => void;
}

/** One line in History; tap to expand the details (FR10). */
export function AlertTile({ row, onViewMap }: Props) {
  const [open, setOpen] = useState(false);
  const c = colorOf(row.type);
  const hasPos = row.lat !== null && row.lng !== null;
  return (
    <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.tile}>
      <View style={styles.head}>
        <View style={[styles.badge, { backgroundColor: `${c}26` }]}>
          <Text style={[styles.badgeText, { color: c }]}>{letterOf(row.type)}</Text>
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.title}>{ALERT_TITLE[row.type]}</Text>
          <Text style={styles.sub}>{row.synced ? 'Saved to your account' : 'Waiting to upload'}</Text>
        </View>
        <Text style={styles.time}>{formatTime(new Date(row.at))}</Text>
      </View>
      {open ? (
        <View style={styles.details}>
          {row.distanceM !== null ? <Text style={styles.detail}>Distance: about {formatMetres(row.distanceM)}</Text> : null}
          <Text style={styles.detail}>
            {hasPos
              ? `Phone location: ${(row.lat as number).toFixed(5)}, ${(row.lng as number).toFixed(5)}`
              : 'No location was saved for this alert.'}
          </Text>
          {hasPos ? <Button label="View on map" kind="outline" compact onPress={() => onViewMap(row)} /> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: space.m, marginBottom: space.s },
  head: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: space.m },
  badgeText: { fontSize: 20, fontWeight: '800' },
  titleBox: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  time: { fontSize: 14, color: colors.muted },
  details: { marginTop: space.m, gap: space.s },
  detail: { fontSize: 14, color: colors.ink },
});

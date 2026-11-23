// src/components/RadarView.tsx
// Distance rings only: Near, Medium, Far. Bluetooth signal strength gives a rough distance but NO
// direction, so the child is never drawn at an angle. The ring of the current zone is highlighted.
import { StyleSheet, Text, View } from 'react-native';
import type { Zone } from '../domain/types';
import { colors } from '../ui/theme';

const ORDER: Zone[] = ['near', 'medium', 'far'];

interface Props {
  zone: Zone;
  /** false while the wearable is not connected: the rings are drawn grey. */
  active: boolean;
  size?: number;
}

export function RadarView({ zone, active, size = 280 }: Props) {
  const half = size / 2;
  const radii = [half / 3, (2 * half) / 3, half];
  const idx = ORDER.indexOf(zone);
  const accent = !active ? colors.grey : zone === 'far' ? colors.coral : colors.teal;
  const ringColor = active ? colors.teal : colors.grey;

  const circle = (r: number, extra: object) => (
    <View
      style={[
        {
          position: 'absolute',
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          left: half - r,
          top: half - r,
        },
        extra,
      ]}
    />
  );

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={active ? `Child is in the ${zone} zone` : 'Wearable not connected'}
    >
      {/* the band of the current zone: a filled circle with the inner circle cut out */}
      {circle(radii[idx] as number, { backgroundColor: `${accent}38` })}
      {idx > 0 ? circle(radii[idx - 1] as number, { backgroundColor: colors.sand }) : null}
      {radii.map((r, i) => circle(r - 1, { borderWidth: 2, borderColor: ringColor, opacity: i === idx ? 1 : 0.4 }))}
      {/* the phone, at the centre */}
      {circle(8, { backgroundColor: colors.tealDark })}
      {ORDER.map((z, i) => (
        <Text key={z} style={[styles.label, { top: half - (radii[i] as number) + 6, color: ringColor }]}>
          {z === 'near' ? 'Near' : z === 'medium' ? 'Medium' : 'Far'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { position: 'absolute', alignSelf: 'center', left: 0, right: 0, textAlign: 'center', fontSize: 12, fontWeight: '700' },
});

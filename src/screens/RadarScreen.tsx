// src/screens/RadarScreen.tsx
import { StyleSheet, Text, View } from 'react-native';
import { formatMetres } from '../core/format';
import { ZONE_LABEL, isLinked } from '../domain/types';
import { RadarView } from '../components/RadarView';
import { LinkChip } from '../components/StatusChip';
import { useMonitor } from '../state/useMonitor';
import { Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function RadarScreen() {
  const snap = useMonitor((s) => s.snapshot);
  const linked = isLinked(snap.link);
  return (
    <Screen contentStyle={{ alignItems: 'center' }}>
      <LinkChip state={snap.link} />
      <Gap h={space.xl} />
      <RadarView zone={snap.zone} active={linked} />
      <Gap h={space.xl} />
      <Text style={[type.big, !linked && { color: colors.grey }]}>{linked ? formatMetres(snap.distanceM) : '–'}</Text>
      <Text style={type.heading}>{linked ? `${ZONE_LABEL[snap.zone]} zone` : 'Looking for the wearable…'}</Text>
      <Gap />
      <View style={styles.note}>
        <Text style={type.small}>
          Safe range: {formatMetres(snap.safeRangeM)}. The distance is estimated from Bluetooth signal strength, so it is approximate and
          changes with walls and bodies. It shows how far, never in which direction.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ note: { paddingHorizontal: space.s } });

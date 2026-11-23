// src/screens/LowBatteryScreen.tsx
// FR12. The same information as the Home banner, with charging tips.
// The alert fires once at 20 % or less and re-arms above 25 %.
import { Text } from 'react-native';
import { BatteryLabel } from '../components/StatusChip';
import { useNav } from '../navigation/types';
import { useMonitor } from '../state/useMonitor';
import { Button } from '../ui/Button';
import { Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function LowBatteryScreen() {
  const nav = useNav();
  const snap = useMonitor((s) => s.snapshot);
  const p = snap.batteryPct;
  return (
    <Screen contentStyle={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 96, color: colors.warn }}>{snap.charging ? '⚡' : '▯'}</Text>
      <BatteryLabel percent={p} charging={snap.charging} />
      <Gap />
      <Text style={[type.heading, { textAlign: 'center' }]}>
        {snap.charging
          ? 'The wearable is charging.'
          : p !== null && p <= 20
            ? 'The battery is low. Please charge the wearable soon.'
            : 'The battery level is fine.'}
      </Text>
      <Gap h={space.xl} />
      <Text style={[type.heading, { alignSelf: 'flex-start' }]}>Charging tips</Text>
      <Gap h={space.s} />
      <Text style={type.body}>
        {'• Use a normal 5 V USB charger or a computer port.\n' +
          '• The charging light on the board is on while it charges and changes when it is full.\n' +
          '• Keep the wearable away from heat while charging.\n' +
          '• You get this alert once; it will warn you again after the battery has been above 25 %.'}
      </Text>
      <Gap h={space.xxl} />
      <Button label="OK" onPress={() => nav.navigate('Tabs')} />
    </Screen>
  );
}

// src/screens/HomeScreen.tsx
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { startMonitoringFlow } from '../actions';
import { ago, formatMetres } from '../core/format';
import { ZONE_LABEL, isLinked, isLowBattery } from '../domain/types';
import { BluetoothOffBanner, LowBatteryBanner, NoticeBanner, PermissionBanner, ServiceBanner } from '../components/Banner';
import { BatteryLabel, LinkChip } from '../components/StatusChip';
import { useNav } from '../navigation/types';
import { runtime } from '../runtime';
import { useMonitor } from '../state/useMonitor';
import { useNow } from '../state/useNow';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function HomeScreen() {
  const nav = useNav();
  const snap = useMonitor((s) => s.snapshot);
  const settings = useSettings((s) => s.settings);
  const now = useNow();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const who = settings.childName || 'Your child';
  const linked = isLinked(snap.link);

  const toggle = async () => {
    setBusy(true);
    setProblem(null);
    try {
      if (snap.monitoring) await runtime.stop();
      else if ((await startMonitoringFlow()) === 'no-permission') setProblem('Allow the permissions above, then try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={type.title}>{who}</Text>
      <Gap h={space.s} />
      <LinkChip state={snap.link} />
      <Gap />

      <PermissionBanner />
      <ServiceBanner />
      {snap.monitoring && !snap.bluetoothOn ? <BluetoothOffBanner /> : null}
      {isLowBattery(snap) ? <LowBatteryBanner percent={snap.batteryPct as number} onPress={() => nav.navigate('LowBattery')} /> : null}
      {problem !== null ? <NoticeBanner text={problem} /> : null}

      {settings.deviceId === null ? (
        <Card>
          <Text style={type.heading}>Pair your wearable</Text>
          <Text style={[type.body, { marginVertical: space.m }]}>
            Switch the wearable on and hold it next to the phone. Then SafeTether can tell you how near your child is.
          </Text>
          <Button label="Pair wearable" onPress={() => nav.navigate('Connections')} />
        </Card>
      ) : (
        <>
          <Card style={{ alignItems: 'center' }}>
            <Text style={type.small}>Approximate distance</Text>
            <Text style={[type.big, !linked && { color: colors.grey }]}>{linked ? formatMetres(snap.distanceM) : '–'}</Text>
            <Text style={type.heading}>{linked ? `${ZONE_LABEL[snap.zone]} zone` : 'Not connected'}</Text>
            <Gap h={space.s} />
            <View style={styles.row}>
              <BatteryLabel percent={snap.batteryPct} charging={snap.charging} />
            </View>
            <Text style={type.small}>
              Safe range {formatMetres(snap.safeRangeM)} · last signal {ago(snap.lastSeen, now)}
            </Text>
          </Card>
          <Button label="Where is my child?" onPress={() => nav.navigate('Radar')} />
          <Gap h={space.s} />
          <Button label="Find child (ring the wearable)" kind="outline" onPress={() => nav.navigate('Buzzer')} />
          <Gap h={space.s} />
          <Button label="Last known location" kind="outline" onPress={() => nav.navigate('LastLocation')} />
          <Gap h={space.l} />
          <Button
            label={snap.monitoring ? 'Stop monitoring' : 'Start monitoring'}
            kind={snap.monitoring ? 'danger' : 'primary'}
            busy={busy}
            onPress={() => void toggle()}
          />
        </>
      )}
      <Gap h={space.l} />
      <Text style={type.small}>
        A Bluetooth wearable cannot see where a child is; it only tells you how near the child is to your phone.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });

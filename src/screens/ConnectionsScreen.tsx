// src/screens/ConnectionsScreen.tsx
// FR2, FR3. Scan for a wearable, pair it (one wearable, one parent) or forget it.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { startMonitoringFlow } from '../actions';
import { currentUser } from '../data/auth';
import { DeviceClaimedError, claimDevice, releaseDevice, saveProfile } from '../data/remote';
import { ago } from '../core/format';
import { isLinked } from '../domain/types';
import { LinkChip } from '../components/StatusChip';
import { useNav } from '../navigation/types';
import { ble, runtime } from '../runtime';
import { requestBluetooth } from '../services/permissions';
import type { FoundDevice } from '../services/bleTypes';
import { useMonitor } from '../state/useMonitor';
import { useNow } from '../state/useNow';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function ConnectionsScreen() {
  const nav = useNav();
  const settings = useSettings((s) => s.settings);
  const snap = useMonitor((s) => s.snapshot);
  const now = useNow();
  const [found, setFound] = useState<FoundDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [pairing, setPairing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showScan, setShowScan] = useState(settings.deviceId === null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      void ble.stopScan();
    };
  }, []);

  const scan = useCallback(async () => {
    setError(null);
    setFound([]);
    if (!(await requestBluetooth())) {
      setError('Allow "Nearby devices" so the app can find the wearable.');
      return;
    }
    if (!snap.bluetoothOn) {
      setError('Please switch Bluetooth on.');
      return;
    }
    setScanning(true);
    try {
      await ble.scan((d) => {
        if (!alive.current) return;
        setFound((list) => (list.some((x) => x.id === d.id) ? list.map((x) => (x.id === d.id ? d : x)) : [...list, d]));
      }, 10_000);
    } catch (e) {
      setError(`Could not start scanning: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      if (alive.current) setScanning(false);
    }
  }, [snap.bluetoothOn]);

  const pair = async (d: FoundDevice) => {
    setPairing(d.id);
    setError(null);
    try {
      await ble.stopScan();
      const online = currentUser() !== null && !settings.localOnly;
      if (online) {
        if (settings.deviceId !== null && settings.deviceId !== d.id) await releaseDevice(settings.deviceId).catch(() => undefined);
        await claimDevice(d.id); // refused when another account already owns it
      }
      await runtime.stop();
      await useSettings.getState().update({ deviceId: d.id });
      await startMonitoringFlow(); // connecting also starts Android's bonding request
      if (online) {
        const s = useSettings.getState().settings;
        void saveProfile({ name: s.childName, age: s.childAge, note: s.childNote, deviceId: d.id }).catch(() => undefined);
      }
      if (alive.current) setShowScan(false);
    } catch (e) {
      setError(
        e instanceof DeviceClaimedError || (e instanceof Error && e.message.includes('Internet'))
          ? e.message
          : 'Pairing failed. Keep the wearable close, make sure it is on, and try again.',
      );
    } finally {
      if (alive.current) setPairing(null);
    }
  };

  const forget = () =>
    Alert.alert('Forget this wearable?', 'Monitoring stops until you pair a wearable again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Forget',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const id = settings.deviceId;
            try {
              if (id !== null && currentUser() !== null && !settings.localOnly) await releaseDevice(id);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not unpair. Try again when you are online.');
              return;
            }
            await runtime.stop();
            await useSettings.getState().update({ deviceId: null });
            setShowScan(true);
          })();
        },
      },
    ]);

  const reconnect = async () => {
    await runtime.stop();
    await startMonitoringFlow();
  };

  return (
    <Screen>
      {settings.deviceId !== null && !showScan ? (
        <>
          <Card>
            <Text style={type.small}>Paired wearable</Text>
            <Text style={type.heading}>SafeTether wearable</Text>
            <Text style={type.small}>{settings.deviceId}</Text>
            <Gap h={space.m} />
            <LinkChip state={snap.link} />
            <Gap h={space.s} />
            {isLinked(snap.link) && snap.rssiDbm !== null ? <Text style={type.body}>Signal: {Math.round(snap.rssiDbm)} dBm</Text> : null}
            <Text style={type.body}>Last sync: {ago(snap.lastSeen, now)}</Text>
          </Card>
          {error !== null ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Reconnect" onPress={() => void reconnect()} />
          <Gap h={space.s} />
          <Button label="Pair a different wearable" kind="outline" onPress={() => setShowScan(true)} />
          <Gap h={space.s} />
          <Button label="Forget" kind="danger" onPress={forget} />
        </>
      ) : (
        <>
          <Text style={type.heading}>Pair your wearable</Text>
          <Gap h={space.s} />
          <Text style={type.body}>Switch the wearable on and hold it next to the phone. Only SafeTether wearables are listed.</Text>
          <Gap />
          {error !== null ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={scanning ? 'Scanning…' : 'Scan for wearable'} busy={scanning} disabled={pairing !== null} onPress={() => void scan()} />
          <Gap />
          <FlatList
            data={found}
            scrollEnabled={false}
            keyExtractor={(d) => d.id}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={type.heading}>{item.name}</Text>
                    <Text style={type.small}>
                      {item.id}
                      {item.rssi !== null ? ` · ${item.rssi} dBm` : ''}
                    </Text>
                  </View>
                  <Button label="Pair" compact busy={pairing === item.id} disabled={pairing !== null} onPress={() => void pair(item)} />
                </View>
                {pairing === item.id ? <Text style={type.small}>Pairing… accept the Bluetooth pairing request if one appears.</Text> : null}
              </Card>
            )}
            ListEmptyComponent={
              !scanning ? <Text style={[type.small, { textAlign: 'center' }]}>No wearable found.{'\n'}Check that it is switched on and close to the phone.</Text> : undefined
            }
          />
          {settings.deviceId !== null ? <Button label="Cancel" kind="text" onPress={() => setShowScan(false)} /> : null}
        </>
      )}
      <Gap h={space.l} />
      <Button label="Keep monitoring running" kind="text" onPress={() => nav.navigate('BackgroundGuide')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  error: { color: colors.coralDark, marginBottom: space.m },
});

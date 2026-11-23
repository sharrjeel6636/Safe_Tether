// src/screens/SafeRangeScreen.tsx
// FR4. Short / Medium / Long presets, fine steps, and the optional "calibrate at 1 m".
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Defaults } from '../core/constants';
import { isLinked } from '../domain/types';
import { ble } from '../runtime';
import { useMonitor } from '../state/useMonitor';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

const PLACES: Record<string, string> = {
  Short: 'a small room or a shop counter',
  Medium: 'a home, a classroom or a playground corner',
  Long: 'open ground (walls and crowds shorten it a lot)',
};
const MIN = 2;
const MAX = 50;
const CALIBRATE_MS = 10_000;

export function SafeRangeScreen() {
  const s = useSettings((x) => x.settings);
  const snap = useMonitor((x) => x.snapshot);
  const [msg, setMsg] = useState<string | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const preset = Object.entries(Defaults.rangePresets).find(([, m]) => m === s.safeRangeM)?.[0];

  const setRange = (m: number) => void useSettings.getState().update({ safeRangeM: Math.min(MAX, Math.max(MIN, Math.round(m))) });

  const calibrate = () => {
    setMsg('Keep the wearable exactly 1 m from the phone for 10 seconds…');
    setCalibrating(true);
    const readings: number[] = [];
    const off = ble.onRssi((dbm) => readings.push(dbm));
    setTimeout(() => {
      off();
      setCalibrating(false);
      if (readings.length < 5) {
        setMsg('Not enough signal readings. Try again.');
        return;
      }
      const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
      void useSettings.getState().update({ rssiAt1m: Math.round(avg) });
      setMsg(`Saved: signal at 1 m is ${avg.toFixed(0)} dBm.`);
    }, CALIBRATE_MS);
  };

  return (
    <Screen>
      <Text style={type.heading}>Alert me when the wearable is further than:</Text>
      <Gap />
      <View style={styles.chips}>
        {Object.entries(Defaults.rangePresets).map(([name, m]) => (
          <Pressable
            key={name}
            onPress={() => setRange(m)}
            accessibilityRole="radio"
            accessibilityState={{ selected: s.safeRangeM === m }}
            style={[styles.chip, s.safeRangeM === m && styles.chipOn]}
          >
            <Text style={[styles.chipText, s.safeRangeM === m && { color: '#fff' }]}>
              {name} ({m} m)
            </Text>
          </Pressable>
        ))}
      </View>
      <Gap />
      <Card style={{ alignItems: 'center' }}>
        <View style={styles.stepper}>
          <Button label="−" kind="outline" compact onPress={() => setRange(s.safeRangeM - 1)} disabled={s.safeRangeM <= MIN} />
          <Text style={[type.big, { fontSize: 44 }]}>{s.safeRangeM} m</Text>
          <Button label="+" kind="outline" compact onPress={() => setRange(s.safeRangeM + 1)} disabled={s.safeRangeM >= MAX} />
        </View>
        {preset !== undefined ? <Text style={type.small}>Good for: {PLACES[preset]}</Text> : <Text style={type.small}>Custom range</Text>}
      </Card>
      <Text style={type.small}>
        Distance is approximate. It is estimated from Bluetooth signal strength, which changes with walls, bodies and the phone’s position.
        Test the range in the places you use it.
      </Text>

      <Gap h={space.xl} />
      <Text style={type.heading}>Calibration (optional)</Text>
      <Gap h={space.s} />
      <Text style={type.body}>
        Signal at 1 m is now {s.rssiAt1m} dBm (starting value {Defaults.rssiAt1m}). Calibrating on your own phone makes the distance
        a little more accurate.
      </Text>
      <Gap />
      {msg !== null ? <Text style={[type.body, { marginBottom: space.m }]}>{msg}</Text> : null}
      <Button
        label={isLinked(snap.link) ? 'Calibrate at 1 m' : 'Calibrate at 1 m (connect first)'}
        kind="outline"
        busy={calibrating}
        disabled={!isLinked(snap.link)}
        onPress={calibrate}
      />
      {s.rssiAt1m !== Defaults.rssiAt1m ? (
        <Button label="Reset calibration" kind="text" onPress={() => void useSettings.getState().update({ rssiAt1m: Defaults.rssiAt1m })} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: colors.teal, backgroundColor: '#fff' },
  chipOn: { backgroundColor: colors.teal },
  chipText: { fontSize: 15, fontWeight: '700', color: colors.teal },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space.l },
});

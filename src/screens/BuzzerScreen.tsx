// src/screens/BuzzerScreen.tsx
// FR5. Rings the wearable so a nearby child can be found by sound. The wearable stops by itself.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isBuzzing, isLinked } from '../domain/types';
import { runtime } from '../runtime';
import { useMonitor } from '../state/useMonitor';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

const CHOICES = [10, 30, 60];

export function BuzzerScreen() {
  const snap = useMonitor((s) => s.snapshot);
  const [seconds, setSeconds] = useState(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const linked = isLinked(snap.link);
  const ringing = isBuzzing(snap);

  const act = async (job: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await job();
    } catch {
      setError('Could not reach the wearable. Move closer to your child and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Card style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 64 }}>{ringing ? '🔔' : '🔕'}</Text>
        <Text style={type.title}>{ringing ? `Ringing… ${snap.buzzSecondsLeft} s left` : linked ? 'Ready to ring' : 'Cannot reach the wearable'}</Text>
        {!linked ? <Text style={[type.small, { textAlign: 'center' }]}>Move closer to your child. The wearable must be connected.</Text> : null}
      </Card>

      <Text style={type.heading}>How long?</Text>
      <Gap h={space.s} />
      <View style={styles.chips}>
        {CHOICES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setSeconds(c)}
            accessibilityRole="radio"
            accessibilityState={{ selected: seconds === c }}
            style={[styles.chip, seconds === c && styles.chipOn]}
          >
            <Text style={[styles.chipText, seconds === c && { color: '#fff' }]}>{c} s</Text>
          </Pressable>
        ))}
      </View>
      <Gap />
      {error !== null ? <Text style={{ color: colors.coralDark, marginBottom: space.m }}>{error}</Text> : null}
      {ringing ? (
        <Button label="Stop" kind="danger" busy={busy} onPress={() => void act(() => runtime.stopBuzz())} />
      ) : (
        <Button label="Ring the wearable" busy={busy} disabled={!linked} onPress={() => void act(() => runtime.buzz(seconds))} />
      )}
      <Gap />
      <Text style={type.small}>The wearable stops by itself after the chosen time, even if the phone goes out of range.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: space.s },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: colors.teal, backgroundColor: '#fff' },
  chipOn: { backgroundColor: colors.teal },
  chipText: { fontSize: 15, fontWeight: '700', color: colors.teal },
});

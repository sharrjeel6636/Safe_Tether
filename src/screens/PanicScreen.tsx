// src/screens/PanicScreen.tsx
// FR6/FR7. Shown when the parent opens the panic notification. Dismissing needs a 1.5 s hold.
import { useState } from 'react';
import { Text } from 'react-native';
import { formatDateTime } from '../core/format';
import { ZONE_LABEL, isLinked } from '../domain/types';
import { HoldToConfirm } from '../components/HoldToConfirm';
import { useNav } from '../navigation/types';
import { runtime } from '../runtime';
import { useLatestAlert } from '../state/useLatestAlert';
import { useMonitor } from '../state/useMonitor';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function PanicScreen() {
  const nav = useNav();
  const snap = useMonitor((s) => s.snapshot);
  const who = useSettings((s) => s.settings.childName) || 'Your child';
  const panic = useLatestAlert('panic');
  const [error, setError] = useState<string | null>(null);

  const ring = async () => {
    setError(null);
    try {
      await runtime.buzz();
    } catch {
      setError('Could not reach the wearable. Move closer and try again.');
    }
  };

  return (
    <Screen>
      <Card style={{ backgroundColor: `${colors.coral}22`, borderColor: colors.coral, alignItems: 'center' }}>
        <Text style={[type.title, { color: colors.coralDark, textAlign: 'center' }]}>{who} pressed the panic button</Text>
        <Gap h={space.s} />
        <Text style={type.body}>{panic === null ? 'Just now' : formatDateTime(new Date(panic.at))}</Text>
        <Text style={type.body}>
          {isLinked(snap.link) ? `Last known zone: ${ZONE_LABEL[snap.zone]}` : 'The wearable is not connected right now'}
        </Text>
      </Card>
      {error !== null ? <Text style={{ color: colors.coralDark, marginBottom: space.m }}>{error}</Text> : null}
      <Button label="Ring the wearable" onPress={() => void ring()} disabled={!isLinked(snap.link)} />
      <Gap h={space.s} />
      <Button
        label={panic !== null && panic.lat === null ? 'Getting location…' : 'View location'}
        kind="outline"
        onPress={() => nav.navigate('LastLocation', { alertId: panic?.id })}
        disabled={panic === null || panic.lat === null}
      />
      <Gap h={space.xl} />
      <HoldToConfirm label="Hold to dismiss" onConfirmed={() => nav.navigate('Tabs')} />
    </Screen>
  );
}

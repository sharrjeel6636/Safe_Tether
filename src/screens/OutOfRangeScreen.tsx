// src/screens/OutOfRangeScreen.tsx
// FR8/FR9. The notification opens this screen; the text follows the live state.
import { Text } from 'react-native';
import { formatMetres } from '../core/format';
import { LINK_LABEL } from '../domain/types';
import { LinkChip } from '../components/StatusChip';
import { useNav } from '../navigation/types';
import { useMonitor } from '../state/useMonitor';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function OutOfRangeScreen() {
  const nav = useNav();
  const snap = useMonitor((s) => s.snapshot);
  const who = useSettings((s) => s.settings.childName) || 'your child';

  let headline: string;
  if (snap.link === 'outOfRange') headline = `${who} is outside the safe range`;
  else if (snap.link === 'connected') headline = 'The wearable is connected again.';
  else headline = `Lost contact with ${who}`;
  const bad = snap.link !== 'connected';

  return (
    <Screen>
      <Card style={{ borderColor: bad ? colors.coral : colors.ok, alignItems: 'center' }}>
        <Text style={[type.title, { textAlign: 'center', color: bad ? colors.coralDark : colors.ok }]}>{headline}</Text>
        <Gap h={space.m} />
        <LinkChip state={snap.link} />
        <Gap h={space.m} />
        {snap.link === 'outOfRange' && snap.distanceM !== null ? (
          <Text style={type.body}>
            About {formatMetres(snap.distanceM)} away (safe range {formatMetres(snap.safeRangeM)}).
          </Text>
        ) : (
          <Text style={type.body}>Current status: {LINK_LABEL[snap.link]}</Text>
        )}
      </Card>
      <Button label="Find (ring the wearable)" onPress={() => nav.navigate('Buzzer')} disabled={snap.link !== 'connected' && snap.link !== 'outOfRange'} />
      <Gap h={space.s} />
      <Button label="View location" kind="outline" onPress={() => nav.navigate('LastLocation')} />
      <Gap h={space.s} />
      <Button label="Dismiss" kind="text" onPress={() => nav.navigate('Tabs')} />
      <Gap />
      <Text style={type.small}>The location shown is where your phone was when the alert fired: the wearable has no GPS of its own.</Text>
    </Screen>
  );
}

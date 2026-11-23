// src/screens/LastLocationScreen.tsx
// FR11. The position stored with an alert: where the PARENT'S PHONE was, because the wearable has no GPS.
import { useState } from 'react';
import { Linking, Text } from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { formatDateTime } from '../core/format';
import { ALERT_TITLE } from '../domain/types';
import { MapTiles } from '../components/MapTiles';
import type { RootStackParamList } from '../navigation/types';
import { useLocationAlert } from '../state/useLatestAlert';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function LastLocationScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'LastLocation'>>();
  const row = useLocationAlert(route.params?.alertId);
  const [error, setError] = useState<string | null>(null);

  if (row === undefined) return <Screen><Text style={type.body}>Loading…</Text></Screen>;
  if (row === null || row.lat === null || row.lng === null) {
    return (
      <Screen>
        <Card>
          <Text style={type.heading}>No location saved yet</Text>
          <Gap h={space.s} />
          <Text style={type.body}>
            A location is saved with each alert when Location permission is allowed on this phone. Allow it in Settings, then the next
            alert will include a position.
          </Text>
        </Card>
      </Screen>
    );
  }

  const { lat, lng } = row;
  const open = async () => {
    setError(null);
    try {
      await Linking.openURL(`geo:${lat},${lng}?q=${lat},${lng}(SafeTether)`);
    } catch {
      setError('No maps app found on this phone.');
    }
  };

  return (
    <Screen>
      <MapTiles lat={lat} lng={lng} accuracyM={row.accuracyM} />
      <Gap />
      <Text style={type.heading}>{ALERT_TITLE[row.type]}</Text>
      <Text style={type.body}>{formatDateTime(new Date(row.at))}</Text>
      <Text style={type.body}>
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </Text>
      <Text style={type.small}>Accuracy: {row.accuracyM === null ? 'unknown' : `about ${Math.round(row.accuracyM)} m`}</Text>
      <Gap />
      {error !== null ? <Text style={{ color: colors.coralDark, marginBottom: space.m }}>{error}</Text> : null}
      <Button label="Open in Maps" onPress={() => void open()} />
      <Gap />
      <Text style={type.small}>
        This is where YOUR phone was when the alert happened. The wearable has no GPS; it only tells the phone how near it is.
      </Text>
    </Screen>
  );
}

// src/components/MapTiles.tsx
// A small map with no API key: 3 x 3 OpenStreetMap tiles and a pin. The tile usage policy asks for
// an identifying User-Agent and visible attribution, so both are included. Fine for one parent's
// phone; a published app with many users should use its own tile provider.
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../core/constants';
import { metresPerPixel, tileView } from '../services/mapTiles';
import { colors } from '../ui/theme';

interface Props {
  lat: number;
  lng: number;
  accuracyM: number | null;
  zoom?: number;
}

const ZOOM = 16;

export function MapTiles({ lat, lng, accuracyM, zoom = ZOOM }: Props) {
  const [box, setBox] = useState(0);
  const v = tileView(lat, lng, zoom);
  const scale = box > 0 ? box / v.size : 1;
  const radiusPx = accuracyM === null ? 0 : Math.min(v.size / 2, accuracyM / metresPerPixel(lat, zoom));

  return (
    <View style={styles.frame} onLayout={(e) => setBox(e.nativeEvent.layout.width)}>
      <View style={{ width: v.size, height: v.size, transform: [{ scale }], transformOrigin: 'top left' }}>
        {v.tiles.map((t, i) => (
          <Image
            key={`${t.x}/${t.y}`}
            source={{ uri: t.url, headers: { 'User-Agent': `${APP_NAME}/0.1 (student project)` } }}
            style={{ position: 'absolute', width: 256, height: 256, left: (i % 3) * 256, top: Math.floor(i / 3) * 256 }}
            accessibilityIgnoresInvertColors
          />
        ))}
        {radiusPx > 4 ? (
          <View
            style={{
              position: 'absolute',
              left: v.pinX - radiusPx,
              top: v.pinY - radiusPx,
              width: radiusPx * 2,
              height: radiusPx * 2,
              borderRadius: radiusPx,
              backgroundColor: `${colors.teal}26`,
              borderWidth: 1,
              borderColor: colors.teal,
            }}
          />
        ) : null}
        <View style={[styles.pin, { left: v.pinX - 9, top: v.pinY - 9 }]} />
      </View>
      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 1, overflow: 'hidden', borderRadius: 16, backgroundColor: '#E8EEEC' },
  pin: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: colors.coralDark, borderWidth: 3, borderColor: '#fff' },
  attribution: { position: 'absolute', right: 6, bottom: 4, fontSize: 11, color: '#333', backgroundColor: '#ffffffcc', paddingHorizontal: 4 },
});

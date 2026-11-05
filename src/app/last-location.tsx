import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';

// Helper to calculate OSM tile X, Y for lat, lon at zoom 16
function getTileCoords(lat: number, lon: number, zoom: number = 16) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

export default function LastLocationScreen() {
  const [stateType, setStateType] = useState<'hasLocation' | 'noLocation' | 'loading'>('hasLocation');
  const [mapError, setMapError] = useState(false);

  const lat = 24.86073;
  const lon = 67.00112;
  const zoom = 16;
  const { x: tileX, y: tileY } = getTileCoords(lat, lon, zoom);

  const handleOpenMaps = async () => {
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?q=${lat},${lon}`
      : `geo:${lat},${lon}?q=${lat},${lon}(SafeTether)`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        setMapError(true);
      }
    } catch {
      setMapError(true);
    }
  };

  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Last known location" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev State Switcher */}
        <View style={styles.devMenuCard}>
          <Text style={styles.devTitle}>Dev Location State Switcher:</Text>
          <View style={styles.devStatesRow}>
            {[
              { key: 'hasLocation', label: 'Saved Location' },
              { key: 'noLocation', label: 'No Location' },
              { key: 'loading', label: 'Loading…' },
            ].map((st) => (
              <TouchableOpacity
                key={st.key}
                style={[styles.devStateBtn, stateType === st.key && styles.devStateBtnActive]}
                onPress={() => {
                  setStateType(st.key as any);
                  setMapError(false);
                }}
              >
                <Text style={[styles.devStateText, stateType === st.key && styles.devStateTextActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {stateType === 'loading' ? (
          <View style={styles.centerBox}>
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : stateType === 'noLocation' ? (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>No location saved yet</Text>
            <Text style={styles.cardBody}>
              A location is saved with each alert when Location permission is allowed on this phone. Allow it in Settings, then the next alert will include a position.
            </Text>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            {/* Map 328 wide x 220 high, radius 16, clipped */}
            <View style={styles.mapContainer}>
              {/* 3x3 OSM Tile Grid */}
              <View style={styles.tileGrid}>
                {[-1, 0, 1].map((dy) =>
                  [-1, 0, 1].map((dx) => {
                    const tx = tileX + dx;
                    const ty = tileY + dy;
                    const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
                    return (
                      <Image
                        key={`${dx}-${dy}`}
                        source={{ uri: tileUrl }}
                        style={styles.tileImage}
                      />
                    );
                  })
                )}
              </View>

              {/* Accuracy Circle */}
              <View style={styles.accuracyCircle} />

              {/* Center Pin */}
              <View style={styles.centerPinOuter}>
                <View style={styles.centerPinInner} />
              </View>
            </View>

            {/* OSM Attribution */}
            <Text style={styles.captionMuted}>Map tiles © OpenStreetMap contributors</Text>

            {/* Details Card */}
            <View style={styles.detailsCard}>
              <Text style={styles.alertTitleHeading}>Out of range</Text>
              <Text style={styles.bodyText}>28 Oct 2026, 13:05</Text>
              <Text style={styles.bodyText}>24.86073, 67.00112</Text>
              <Text style={styles.smallMuted}>Accuracy: about 12 m</Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleOpenMaps}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Open in Maps</Text>
              </TouchableOpacity>

              {mapError && (
                <Text style={styles.errorText}>No maps app found on this phone.</Text>
              )}
            </View>

            {/* Footer Note */}
            <Text style={styles.footerNote}>
              This is where YOUR phone was when the alert happened. The wearable has no GPS; it only tells the phone how near it is.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  devMenuCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  devStatesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  devStateBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  devStateBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  devStateText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
  devStateTextActive: {
    color: '#FFFFFF',
  },
  centerBox: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  cardBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    lineHeight: 20,
  },
  cardContainer: {
    gap: 8,
    alignItems: 'center',
  },
  mapContainer: {
    width: 328,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tileGrid: {
    position: 'absolute',
    top: -128,
    left: -128,
    width: 768,
    height: 768,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tileImage: {
    width: 256,
    height: 256,
  },
  accuracyCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 90,
    height: 90,
    marginTop: -45,
    marginLeft: -45,
    borderRadius: 45,
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderWidth: 1.5,
    borderColor: Colors.coral,
  },
  centerPinOuter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 22,
    height: 22,
    marginTop: -11,
    marginLeft: -11,
    borderRadius: 11,
    backgroundColor: Colors.coral,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  centerPinInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  captionMuted: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    alignSelf: 'flex-start',
    paddingHorizontal: 4,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  alertTitleHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  bodyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  smallMuted: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.coral,
    textAlign: 'center',
    marginTop: 4,
  },
  footerNote: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
    lineHeight: 18,
  },
});

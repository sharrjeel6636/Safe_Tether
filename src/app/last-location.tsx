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
import { useLocationAlert } from '../state/hooks';

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
  const locationInfo = useLocationAlert();
  const lat = locationInfo.latitude;
  const lon = locationInfo.longitude;
  const address = locationInfo.address;
  const zoom = 16;
  const { x: tileX, y: tileY } = getTileCoords(lat, lon, zoom);
  const [mapError, setMapError] = useState(false);

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
            <Text style={styles.bodyText}>{address}</Text>
            <Text style={styles.bodyText}>{lat.toFixed(5)}, {lon.toFixed(5)}</Text>
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
  cardContainer: {
    gap: 12,
  },
  mapContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.border,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileGrid: {
    position: 'absolute',
    width: '300%',
    height: '300%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tileImage: {
    width: '33.333%',
    height: '33.333%',
  },
  accuracyCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  centerPinOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 148, 136, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  captionMuted: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  alertTitleHeading: {
    fontSize: 18,
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
    color: Colors.textMuted,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
    color: Colors.coral,
    marginTop: 4,
  },
  footerNote: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 18,
  },
});

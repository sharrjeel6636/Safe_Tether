import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';
import { initialChildProfile } from '../mock/data';

export default function RadarScreen() {
  const [radarState, setRadarState] = useState<'medium' | 'far' | 'searching'>('medium');

  let isConnected = true;
  let zone: 'Near' | 'Medium' | 'Far' = 'Medium';
  let distance = '4 m';
  let headingText = 'Medium zone';
  let chipLabel = 'Connected';
  let chipColor = Colors.success;
  let chipBg = '#D1FAE5';

  if (radarState === 'medium') {
    isConnected = true;
    zone = 'Medium';
    distance = '4 m';
    headingText = 'Medium zone';
    chipLabel = 'Connected';
    chipColor = Colors.success;
    chipBg = '#D1FAE5';
  } else if (radarState === 'far') {
    isConnected = true;
    zone = 'Far';
    distance = '12 m';
    headingText = 'Far zone';
    chipLabel = 'Out of range';
    chipColor = Colors.coral;
    chipBg = Colors.coralLight;
  } else if (radarState === 'searching') {
    isConnected = false;
    zone = 'Near'; // default display ring
    distance = '–';
    headingText = 'Looking for the wearable…';
    chipLabel = 'Searching';
    chipColor = Colors.warning;
    chipBg = '#FEF3C7';
  }

  const ringColor = isConnected ? Colors.primary : Colors.border;

  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Where is my child" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev State Switcher */}
        <View style={styles.devMenuCard}>
          <Text style={styles.devTitle}>Dev Radar State Switcher:</Text>
          <View style={styles.devStatesRow}>
            {[
              { key: 'medium', label: 'Medium (4m)' },
              { key: 'far', label: 'Far (12m)' },
              { key: 'searching', label: 'Searching' },
            ].map((st) => (
              <TouchableOpacity
                key={st.key}
                style={[styles.devStateBtn, radarState === st.key && styles.devStateBtnActive]}
                onPress={() => setRadarState(st.key as any)}
              >
                <Text style={[styles.devStateText, radarState === st.key && styles.devStateTextActive]}>
                  {st.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.centerWrapper}>
          {/* StatusChip */}
          <View style={[styles.statusChip, { backgroundColor: chipBg }]}>
            <View style={[styles.statusDot, { backgroundColor: chipColor }]} />
            <Text style={[styles.statusText, { color: chipColor }]}>{chipLabel}</Text>
          </View>

          {/* Radar Box 280 x 280 */}
          <View style={styles.radarBox}>
            {/* Ring 3 (Far): diameter 280 */}
            <View
              style={[
                styles.ringCircle,
                {
                  width: 280,
                  height: 280,
                  borderRadius: 140,
                  borderColor: ringColor,
                  opacity: zone === 'Far' ? 1.0 : 0.4,
                  backgroundColor:
                    isConnected && zone === 'Far'
                      ? 'rgba(244, 63, 94, 0.22)'
                      : !isConnected
                      ? 'rgba(148, 163, 184, 0.1)'
                      : 'transparent',
                },
              ]}
            >
              <Text style={styles.ringLabel}>Far</Text>
            </View>

            {/* Ring 2 (Medium): diameter ~186.6 */}
            <View
              style={[
                styles.ringCircle,
                {
                  width: 186.6,
                  height: 186.6,
                  borderRadius: 93.3,
                  borderColor: ringColor,
                  opacity: zone === 'Medium' ? 1.0 : 0.4,
                  backgroundColor:
                    isConnected && zone === 'Medium'
                      ? 'rgba(13, 148, 136, 0.22)'
                      : 'transparent',
                },
              ]}
            >
              <Text style={styles.ringLabel}>Medium</Text>
            </View>

            {/* Ring 1 (Near): diameter ~93.3 */}
            <View
              style={[
                styles.ringCircle,
                {
                  width: 93.3,
                  height: 93.3,
                  borderRadius: 46.6,
                  borderColor: ringColor,
                  opacity: zone === 'Near' ? 1.0 : 0.4,
                  backgroundColor:
                    isConnected && zone === 'Near'
                      ? 'rgba(13, 148, 136, 0.22)'
                      : 'transparent',
                },
              ]}
            >
              <Text style={styles.ringLabel}>Near</Text>
            </View>

            {/* Center Phone Dot (16px) */}
            <View style={styles.centerPhoneDot} />
          </View>

          {/* Big Distance */}
          <Text style={styles.bigDistanceText}>{distance}</Text>

          {/* Heading */}
          <Text style={styles.headingText}>{headingText}</Text>

          {/* Small Muted Note */}
          <Text style={styles.mutedNote}>
            Safe range: {initialChildProfile.safeRangeMeters} m. The distance is estimated from Bluetooth signal strength, so it is approximate and changes with walls and bodies. It shows how far, never in which direction.
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
  centerWrapper: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  radarBox: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 12,
  },
  ringCircle: {
    position: 'absolute',
    borderWidth: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  ringLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    backgroundColor: Colors.sand,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  centerPhoneDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0F766E', // tealDark
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  bigDistanceText: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.primary,
  },
  headingText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  mutedNote: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginTop: 4,
  },
});

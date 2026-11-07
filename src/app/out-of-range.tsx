import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';
import { useMonitor } from '../state/hooks';

export default function OutOfRangeScreen() {
  const { profile } = useMonitor();
  const [variant, setVariant] = useState<'outOfRange' | 'connected' | 'lostContact'>('outOfRange');
  const name = profile.name || 'Leo';

  let headline = `${name} is outside the safe range`;
  let chipLabel = 'Out of range';
  let chipColor = Colors.coral;
  let chipBg = Colors.coralLight;
  let body = 'About 12 m away (safe range 10 m).';

  if (variant === 'connected') {
    headline = 'The wearable is connected again.';
    chipLabel = 'Connected';
    chipColor = Colors.success;
    chipBg = '#D1FAE5';
    body = 'Current status: Connected';
  } else if (variant === 'lostContact') {
    headline = `Lost contact with ${name}`;
    chipLabel = 'Connection lost';
    chipColor = Colors.coral;
    chipBg = Colors.coralLight;
    body = 'Current status: Connection lost';
  }

  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Out of range" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev Variant Switcher */}
        <View style={styles.devMenuCard}>
          <Text style={styles.devTitle}>Dev Variant Switcher:</Text>
          <View style={styles.devStatesRow}>
            {(
              [
                { key: 'outOfRange', label: 'Out of Range' },
                { key: 'connected', label: 'Connected' },
                { key: 'lostContact', label: 'Lost Contact' },
              ] as const
            ).map((v) => (
              <TouchableOpacity
                key={v.key}
                style={[styles.devStateBtn, variant === v.key && styles.devStateBtnActive]}
                onPress={() => setVariant(v.key)}
              >
                <Text style={[styles.devStateText, variant === v.key && styles.devStateTextActive]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={[styles.statusChip, { backgroundColor: chipBg }]}>
              <View style={[styles.statusDot, { backgroundColor: chipColor }]} />
              <Text style={[styles.statusText, { color: chipColor }]}>{chipLabel}</Text>
            </View>
          </View>

          <Text style={styles.headline} numberOfLines={3}>
            {headline}
          </Text>

          <Text style={styles.bodyLine}>{body}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/buzzer')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Find (ring the wearable)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push('/last-location')}
              activeOpacity={0.85}
            >
              <Text style={styles.outlineButtonText}>View location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textButton}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.7}
            >
              <Text style={styles.textButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Small muted note */}
        <Text style={styles.mutedNote}>
          The location shown is where your phone was when the alert fired: the wearable has no GPS of its own.
        </Text>
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
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    lineHeight: 28,
  },
  bodyLine: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textMuted,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 4,
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
  outlineButton: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: '600',
  },
  textButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  mutedNote: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
    lineHeight: 18,
  },
});

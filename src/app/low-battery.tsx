import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useMonitor } from '../state/hooks';

export default function LowBatteryScreen() {
  const { snapshot } = useMonitor();
  const batteryPct = snapshot.batteryPct;
  const isCharging = snapshot.charging;

  const isLow = batteryPct <= 20 && !isCharging;
  const warnColor = isLow ? Colors.coral : Colors.warning;

  let headingText = 'The battery level is fine.';
  if (isLow) {
    headingText = 'The battery is low. Please charge the wearable soon.';
  } else if (isCharging) {
    headingText = 'The wearable is charging.';
  }

  // Calculate proportional height for level bar (max height inside body ~ 82px)
  const maxBarHeight = 82;
  const levelBarHeight = Math.max(8, Math.round((batteryPct / 100) * maxBarHeight));

  const chargingTips = [
    'Use a normal 5 V USB charger or a computer port.',
    'The charging light on the board is on while it charges and changes when it is full.',
    'Keep the wearable away from heat while charging.',
    'You get this alert once; it will warn you again after the battery has been above 25 %.',
  ];

  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Wearable battery" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentCard}>
          {/* Battery Icon (64 x 104) */}
          <View style={styles.batteryIconWrapper}>
            {/* Nub on top */}
            <View style={[styles.batteryNub, { backgroundColor: warnColor }]} />
            {/* Body */}
            <View style={[styles.batteryBody, { borderColor: warnColor }]}>
              {isCharging ? (
                <View style={styles.chargingContainer}>
                  <Ionicons name="flash" size={32} color={Colors.warning} />
                </View>
              ) : (
                <View style={styles.batteryLevelContainer}>
                  <View
                    style={[
                      styles.batteryLevelBar,
                      { height: levelBarHeight, backgroundColor: warnColor },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Heading Battery % */}
          <Text style={styles.batteryTitle}>Battery {batteryPct} %</Text>

          {/* Status Heading */}
          <Text style={styles.statusHeading}>{headingText}</Text>
        </View>

        {/* Charging Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsHeading}>Charging tips</Text>
          <View style={styles.tipsList}>
            {chargingTips.map((tip, idx) => (
              <View key={idx} style={styles.tipRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary OK Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>OK</Text>
        </TouchableOpacity>
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
  contentCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  batteryIconWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  batteryNub: {
    width: 24,
    height: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  batteryBody: {
    width: 64,
    height: 94,
    borderRadius: 10,
    borderWidth: 6,
    backgroundColor: Colors.cardBg,
    padding: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  batteryLevelContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  batteryLevelBar: {
    width: '100%',
    borderRadius: 4,
  },
  chargingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
  },
  statusHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  tipsHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  tipsList: {
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

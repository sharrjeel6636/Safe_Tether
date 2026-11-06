import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { initialChildProfile } from '../../mock/data';

export default function HomeScreen() {
  // States: A (unpaired), B (connected near), C (out of range + low battery), D (monitoring on + bt off + notification missing)
  const [currentState, setCurrentState] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [monitoring, setMonitoring] = useState(false);
  const [loadingMonitor, setLoadingMonitor] = useState(false);
  const [showDevMenu, setShowDevMenu] = useState(false);

  // Computed state variables based on A, B, C, D
  const isPaired = currentState !== 'A';
  const childName = initialChildProfile.name || 'Your child';

  let linkStatus = 'Connected';
  let statusColor = Colors.success;
  let statusBg = '#D1FAE5';
  let distance = '4 m';
  let zone = 'Near zone';
  let battery = 82;
  let notificationsMissing = false;
  let bluetoothOff = false;
  let batteryLow = false;
  let backgroundProtectionOff = false;

  if (currentState === 'A') {
    linkStatus = 'Disconnected';
    statusColor = Colors.coral;
    statusBg = Colors.coralLight;
    distance = '–';
    zone = 'Not connected';
  } else if (currentState === 'B') {
    linkStatus = 'Connected';
    statusColor = Colors.success;
    statusBg = '#D1FAE5';
    distance = '4 m';
    zone = 'Near zone';
    battery = 82;
  } else if (currentState === 'C') {
    linkStatus = 'Out of range';
    statusColor = Colors.coral;
    statusBg = Colors.coralLight;
    distance = '12 m';
    zone = 'Far zone';
    battery = 18;
    batteryLow = true;
  } else if (currentState === 'D') {
    linkStatus = 'Searching';
    statusColor = Colors.warning;
    statusBg = '#FEF3C7';
    distance = '–';
    zone = 'Not connected';
    notificationsMissing = true;
    bluetoothOff = true;
    battery = 65;
  }

  const handleToggleMonitoring = () => {
    setLoadingMonitor(true);
    setTimeout(() => {
      setLoadingMonitor(false);
      setMonitoring(!monitoring);
    }, 600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Dev Menu Toggle & State Switcher */}
      <View style={styles.devMenuCard}>
        <TouchableOpacity
          style={styles.devHeaderRow}
          onPress={() => setShowDevMenu(!showDevMenu)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="bug-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.devTitle}>Dev State Switcher: [{currentState}]</Text>
          </View>
          <Ionicons name={showDevMenu ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        {showDevMenu && (
          <View style={styles.devStatesRow}>
            {(['A', 'B', 'C', 'D'] as const).map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.devStateBtn, currentState === st && styles.devStateBtnActive]}
                onPress={() => {
                  setCurrentState(st);
                  if (st === 'D') setMonitoring(true);
                }}
              >
                <Text style={[styles.devStateText, currentState === st && styles.devStateTextActive]}>
                  State {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Top: Child Name & StatusChip */}
      <View style={styles.headerRow}>
        <Text style={styles.childName}>{childName}</Text>
        <View style={[styles.statusChip, { backgroundColor: statusBg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{linkStatus}</Text>
        </View>
      </View>

      {/* Banners (each only when condition is true) */}
      {notificationsMissing && (
        <View style={[styles.banner, styles.bannerAlert]}>
          <Ionicons name="notifications-off-outline" size={20} color={Colors.coral} style={styles.bannerIcon} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>Allow: Notifications. Alerts cannot work without this.</Text>
          </View>
          <TouchableOpacity
            style={styles.bannerActionBtn}
            onPress={() => Alert.alert('Permission', 'Notifications permission granted.')}
          >
            <Text style={styles.bannerActionText}>Fix</Text>
          </TouchableOpacity>
        </View>
      )}

      {bluetoothOff && (
        <View style={[styles.banner, styles.bannerAlert]}>
          <Ionicons name="bluetooth-outline" size={20} color={Colors.coral} style={styles.bannerIcon} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>Bluetooth is off. The wearable cannot be reached.</Text>
          </View>
          <TouchableOpacity
            style={styles.bannerActionBtn}
            onPress={() => Alert.alert('Bluetooth', 'Bluetooth turned on.')}
          >
            <Text style={styles.bannerActionText}>Turn on</Text>
          </TouchableOpacity>
        </View>
      )}

      {batteryLow && (
        <View style={[styles.banner, styles.bannerWarn]}>
          <Ionicons name="battery-dead-outline" size={20} color={Colors.warning} style={styles.bannerIcon} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>Wearable battery is low ({battery} %).</Text>
          </View>
          <TouchableOpacity
            style={styles.bannerActionBtn}
            onPress={() => router.push('/low-battery')}
          >
            <Text style={styles.bannerActionText}>Details</Text>
          </TouchableOpacity>
        </View>
      )}

      {backgroundProtectionOff && (
        <View style={[styles.banner, styles.bannerAlert]}>
          <Ionicons name="shield-outline" size={20} color={Colors.coral} style={styles.bannerIcon} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>Background protection is off. Alerts may stop when you close the app.</Text>
          </View>
          <TouchableOpacity
            style={styles.bannerActionBtn}
            onPress={() => router.push('/background-guide')}
          >
            <Text style={styles.bannerActionText}>App settings</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Wearable Card */}
      {!isPaired ? (
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Pair your wearable</Text>
          <Text style={styles.cardBody}>
            Switch the wearable on and hold it next to the phone. Then SafeTether can tell you how near your child is.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/connections')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Pair wearable</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardCentered}>
          <Text style={styles.smallMuted}>Approximate distance</Text>
          <Text style={styles.bigDistance}>{distance}</Text>
          <Text style={styles.zoneHeading}>{zone}</Text>
          <Text style={styles.smallInk}>Battery {battery} %</Text>
          <Text style={styles.smallMutedInfo}>Safe range 10 m · last signal 3 s ago</Text>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/radar')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Where is my child</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push('/buzzer')}
              activeOpacity={0.85}
            >
              <Text style={styles.outlineButtonText}>Find child (ring the wearable)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push('/last-location')}
              activeOpacity={0.85}
            >
              <Text style={styles.outlineButtonText}>Last known location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.monitorButton, monitoring ? styles.dangerButton : styles.primaryButton]}
              onPress={handleToggleMonitoring}
              activeOpacity={0.85}
              disabled={loadingMonitor}
            >
              {loadingMonitor ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {monitoring ? 'Stop monitoring' : 'Start monitoring'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footerText}>
        A Bluetooth wearable cannot see where a child is; it only tells you how near the child is to your phone.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  devMenuCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  devHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  devTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  devStatesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  devStateTextActive: {
    color: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  childName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  bannerAlert: {
    backgroundColor: Colors.coralLight,
    borderColor: Colors.coralBorder,
  },
  bannerWarn: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  bannerIcon: {
    marginRight: 10,
  },
  bannerContent: {
    flex: 1,
    marginRight: 8,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    lineHeight: 18,
  },
  bannerActionBtn: {
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 12,
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardCentered: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  smallMuted: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  bigDistance: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    marginVertical: 4,
  },
  zoneHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  smallInk: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  smallMutedInfo: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginBottom: 16,
  },
  actionButtonsContainer: {
    width: '100%',
    gap: 10,
    marginTop: 8,
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
  monitorButton: {
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  dangerButton: {
    backgroundColor: Colors.coral,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
    lineHeight: 18,
  },
});

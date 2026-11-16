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
import { useSettings, useMonitor, usePermissions, useNow } from '../../state/hooks';
import { startMonitoringFlow } from '../../actions';
import { runtime } from '../../runtime';
import { LINK_LABELS, isLinked, isLowBattery } from '../../domain/types';

export default function HomeScreen() {
  const { childName } = useSettings();
  const { snapshot, isLinked: linked, isLowBattery: lowBattery } = useMonitor();
  const { missing, fixNext } = usePermissions();

  const [loadingMonitor, setLoadingMonitor] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showDevMenu, setShowDevMenu] = useState(false);

  const lastSignalText = useNow();

  const linkStatus = LINK_LABELS[snapshot.link] || 'Connected';
  const statusColor = linked ? Colors.success : Colors.coral;
  const statusBg = linked ? '#D1FAE5' : Colors.coralLight;
  const distance = `${snapshot.distanceM} m`;
  const zone = snapshot.zone;
  const battery = snapshot.batteryPct;
  const notificationsMissing = missing.length > 0;
  const bluetoothOff = !snapshot.bluetoothOn;
  const backgroundProtectionOff = false;

  const handleToggleMonitoring = async () => {
    setLoadingMonitor(true);
    try {
      if (isMonitoring) {
        await runtime.stop();
        setIsMonitoring(false);
      } else {
        await startMonitoringFlow();
        setIsMonitoring(true);
      }
    } finally {
      setLoadingMonitor(false);
    }
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
            <Text style={styles.devTitle}>Dev State Switcher</Text>
          </View>
          <Ionicons name={showDevMenu ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        {showDevMenu && (
          <View style={styles.devStatesRow}>
            <TouchableOpacity
              style={styles.devStateBtn}
              onPress={() => Alert.alert('Dev State', 'Switched state')}
            >
              <Text style={styles.devStateText}>Reset</Text>
            </TouchableOpacity>
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

      {/* Banners */}
      {notificationsMissing && (
        <View style={[styles.banner, styles.bannerAlert]}>
          <Ionicons name="notifications-off-outline" size={20} color={Colors.coral} style={styles.bannerIcon} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerText}>Allow: Notifications. Alerts cannot work without this.</Text>
          </View>
          <TouchableOpacity
            style={styles.bannerActionBtn}
            onPress={fixNext}
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

      {lowBattery && (
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
      {!linked ? (
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
          <Text style={styles.smallMutedInfo}>Safe range 10 m · last signal {lastSignalText}</Text>

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
              style={[styles.monitorButton, isMonitoring ? styles.dangerButton : styles.primaryButton]}
              onPress={handleToggleMonitoring}
              activeOpacity={0.85}
              disabled={loadingMonitor}
            >
              {loadingMonitor ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isMonitoring ? 'Stop monitoring' : 'Start monitoring'}
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
  devStateText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
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

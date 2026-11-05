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
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';

interface DiscoveredDevice {
  name: string;
  mac: string;
  rssi: string;
}

export default function ConnectionsScreen() {
  const [deviceId, setDeviceId] = useState<string | null>('24:6F:28:AB:12:3C');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [pairing, setPairing] = useState(false);

  // Dev toggles
  const [devNoDevice, setDevNoDevice] = useState(false);
  const [devErrorMode, setDevErrorMode] = useState<string | null>(null);

  const handleStartScan = () => {
    setIsScanning(true);
    setDevices([]);
    setScanError(null);

    setTimeout(() => {
      setIsScanning(false);
      if (devErrorMode) {
        setScanError(devErrorMode);
        return;
      }
      if (devNoDevice) {
        setDevices([]);
      } else {
        setDevices([
          { name: 'ST-1A2B', mac: '24:6F:28:AB:12:3C', rssi: '-62 dBm' },
        ]);
      }
    }, 2000);
  };

  const handlePairDevice = (mac: string) => {
    setPairing(true);
    setTimeout(() => {
      setPairing(false);
      setDeviceId(mac);
      setDevices([]);
    }, 800);
  };

  const handleForget = () => {
    Alert.alert(
      'Forget this wearable',
      'Monitoring stops until you pair a wearable again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forget',
          style: 'destructive',
          onPress: () => setDeviceId(null),
        },
      ]
    );
  };

  const isPairedView = deviceId !== null;

  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Wearable connection" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev Menu Card */}
        <View style={styles.devMenuCard}>
          <Text style={styles.devTitle}>Dev Connection State Switcher:</Text>
          <View style={styles.devStatesRow}>
            <TouchableOpacity
              style={[styles.devStateBtn, isPairedView && styles.devStateBtnActive]}
              onPress={() => {
                setDeviceId('24:6F:28:AB:12:3C');
                setScanError(null);
                setDevices([]);
              }}
            >
              <Text style={[styles.devStateText, isPairedView && styles.devStateTextActive]}>
                Paired View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.devStateBtn, !isPairedView && styles.devStateBtnActive]}
              onPress={() => {
                setDeviceId(null);
              }}
            >
              <Text style={[styles.devStateText, !isPairedView && styles.devStateTextActive]}>
                Scan View
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.devStatesRow, { marginTop: 6 }]}>
            <TouchableOpacity
              style={[styles.devStateBtn, devNoDevice && styles.devStateBtnActiveDanger]}
              onPress={() => setDevNoDevice(!devNoDevice)}
            >
              <Text style={[styles.devStateText, devNoDevice && styles.devStateTextActive]}>
                {devNoDevice ? 'No Device: ON' : 'No Device: OFF'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.devStateBtn, devErrorMode === 'Please switch Bluetooth on.' && styles.devStateBtnActiveDanger]}
              onPress={() => setDevErrorMode(devErrorMode ? null : 'Please switch Bluetooth on.')}
            >
              <Text style={[styles.devStateText, devErrorMode === 'Please switch Bluetooth on.' && styles.devStateTextActive]}>
                BT Off Error
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isPairedView ? (
          <>
            {/* Paired Card */}
            <View style={styles.card}>
              <Text style={styles.smallMuted}>Paired wearable</Text>
              <Text style={styles.headingTitle}>SafeTether wearable</Text>
              <Text style={styles.smallMuted}>{deviceId}</Text>

              <View style={{ height: 4 }} />

              <View style={styles.statusChipRow}>
                <View style={styles.statusChip}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Connected</Text>
                </View>
              </View>

              <Text style={styles.bodyText}>Signal: -68 dBm</Text>
              <Text style={styles.bodyText}>Last sync: just now</Text>
            </View>

            {/* Actions */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => Alert.alert('Reconnect', 'Attempting reconnection to wearable...')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Reconnect</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => setDeviceId(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineButtonText}>Pair a different wearable</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleForget}
                activeOpacity={0.85}
              >
                <Text style={styles.dangerButtonText}>Forget</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.textButton}
                onPress={() => router.push('/background-guide')}
                activeOpacity={0.7}
              >
                <Text style={styles.textButtonText}>Keep monitoring running</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Scan View */}
            <View style={styles.card}>
              <Text style={styles.headingTitle}>Pair your wearable</Text>
              <Text style={styles.cardBody}>
                Switch the wearable on and hold it next to the phone. Only SafeTether wearables are listed.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStartScan}
                activeOpacity={0.85}
                disabled={isScanning}
              >
                {isScanning ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.primaryButtonText}>Scanning…</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Scan for wearable</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Scan Error */}
            {scanError && (
              <View style={styles.errorCard}>
                <Text style={styles.errorBodyText}>{scanError}</Text>
              </View>
            )}

            {/* Scan Results */}
            {devices.length > 0 && (
              <View style={styles.resultsContainer}>
                {devices.map((dev, idx) => (
                  <View key={idx} style={styles.deviceRowCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deviceName}>{dev.name}</Text>
                      <Text style={styles.deviceSub}>{dev.mac} · {dev.rssi}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.pairCompactButton}
                      onPress={() => handlePairDevice(dev.mac)}
                      activeOpacity={0.85}
                      disabled={pairing}
                    >
                      {pairing ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.pairCompactText}>Pair</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Empty Scan Result */}
            {!isScanning && devices.length === 0 && !scanError && (
              <View style={styles.emptyScanBox}>
                <Text style={styles.emptyScanText}>
                  No wearable found. Check that it is switched on and close to the phone.
                </Text>
              </View>
            )}

            {/* Footer Text Button */}
            <TouchableOpacity
              style={[styles.textButton, { alignSelf: 'center', marginTop: 8 }]}
              onPress={() => router.push('/background-guide')}
              activeOpacity={0.7}
            >
              <Text style={styles.textButtonText}>Keep monitoring running</Text>
            </TouchableOpacity>
          </>
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
  devStateBtnActiveDanger: {
    backgroundColor: Colors.coral,
    borderColor: Colors.coral,
  },
  devStateText: {
    fontSize: 12,
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
    gap: 4,
  },
  smallMuted: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  headingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginVertical: 2,
  },
  cardBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusChipRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
  bodyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 2,
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
  dangerButton: {
    backgroundColor: Colors.coralLight,
    borderWidth: 1,
    borderColor: Colors.coralBorder,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerButtonText: {
    color: Colors.coral,
    fontSize: 15,
    fontWeight: '700',
  },
  textButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  resultsContainer: {
    gap: 8,
  },
  deviceRowCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  deviceSub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  pairCompactButton: {
    width: 72,
    height: 38,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairCompactText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  errorCard: {
    backgroundColor: Colors.coralLight,
    borderWidth: 1,
    borderColor: Colors.coralBorder,
    borderRadius: 14,
    padding: 14,
  },
  errorBodyText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.coral,
    lineHeight: 20,
  },
  emptyScanBox: {
    paddingVertical: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyScanText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

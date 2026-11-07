import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  Vibration,
} from 'react-native';
import { router } from 'expo-router';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';
import { useMonitor } from '../state/hooks';

export default function PanicScreen() {
  const { profile } = useMonitor();
  // Dev interactive states for testing both connected and disconnected states
  const [isConnected, setIsConnected] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [hasError, setHasError] = useState(false);

  const name = profile.name || 'Leo';
  const timestampText = '28 Oct 2026, 14:32';
  const zoneText = isConnected
    ? 'Last known zone: Medium'
    : 'The wearable is not connected right now';

  // Animation for hold to dismiss (1.5 seconds) using useState initializer to avoid ref render lint rule
  const [progressAnim] = useState(() => new Animated.Value(0));

  const handlePressIn = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500, // 1.5 seconds
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        Vibration.vibrate(300);
        router.replace('/(tabs)');
      }
    });
  };

  const handlePressOut = () => {
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const handleViewLocation = () => {
    if (isLocating) return;
    router.push('/last-location');
  };

  const handleRingWearable = () => {
    if (!isConnected) return;
    router.push('/buzzer');
  };

  return (
    <View style={styles.container}>
      {/* AppBar kind panic (coral) titled "Panic alert" */}
      <AppBar kind="panic" title="Panic alert" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev State Switcher (to test connected/disconnected & locating states) */}
        <View style={styles.devMenuCard}>
          <Text style={styles.devTitle}>Dev State Switcher:</Text>
          <View style={styles.devStatesRow}>
            <TouchableOpacity
              style={[styles.devStateBtn, isConnected && styles.devStateBtnActive]}
              onPress={() => setIsConnected(!isConnected)}
            >
              <Text style={[styles.devStateText, isConnected && styles.devStateTextActive]}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devStateBtn, isLocating && styles.devStateBtnActive]}
              onPress={() => setIsLocating(!isLocating)}
            >
              <Text style={[styles.devStateText, isLocating && styles.devStateTextActive]}>
                {isLocating ? 'Finding Location…' : 'Location Ready'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devStateBtn, hasError && styles.devStateBtnActive]}
              onPress={() => setHasError(!hasError)}
            >
              <Text style={[styles.devStateText, hasError && styles.devStateTextActive]}>
                {hasError ? 'Error On' : 'No Error'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Card (content centred, gap 8, coralSoft fill, 1 px coral border) */}
        <View style={styles.panicCard}>
          <Text style={styles.cardTitle}>{name} pressed the panic button</Text>
          <Text style={styles.cardBody}>{timestampText}</Text>
          <Text style={styles.cardBody}>{zoneText}</Text>

          {hasError && (
            <Text style={styles.errorBodyLine}>
              Could not reach the wearable. Move closer and try again.
            </Text>
          )}
        </View>

        {/* Primary Button "Ring the wearable" (disabled at 45% opacity when not connected) */}
        <TouchableOpacity
          style={[styles.primaryButton, !isConnected && styles.buttonDisabled]}
          onPress={handleRingWearable}
          activeOpacity={0.85}
          disabled={!isConnected}
        >
          <Text style={styles.primaryButtonText}>Ring the wearable</Text>
        </TouchableOpacity>

        {/* Outline Button "View location" (or "Getting location…") */}
        <TouchableOpacity
          style={[styles.outlineButton, isLocating && styles.buttonDisabled]}
          onPress={handleViewLocation}
          activeOpacity={0.85}
          disabled={isLocating}
        >
          <Text style={styles.outlineButtonText}>
            {isLocating ? 'Getting location…' : 'View location'}
          </Text>
        </TouchableOpacity>

        {/* Loud alarm notice */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            🔊 The panic alert is loud and active at maximum volume.
          </Text>
        </View>

        {/* Flexible spacer area */}
        <View style={{ flex: 1, minHeight: 32 }} />

        {/* Hold to dismiss control */}
        <View style={styles.holdContainer}>
          <Pressable
            style={styles.holdPill}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            {/* CoralSoft progress fill growing from left over 1.5 seconds */}
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            <Text style={styles.holdButtonText}>Hold to dismiss</Text>
          </Pressable>
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
    flexGrow: 1,
    paddingBottom: 32,
  },
  devMenuCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.coralDark,
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
    backgroundColor: Colors.coral,
    borderColor: Colors.coral,
  },
  devStateText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
  devStateTextActive: {
    color: '#FFFFFF',
  },
  panicCard: {
    backgroundColor: Colors.coralSoft,
    borderWidth: 1,
    borderColor: Colors.coral,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.coralDark,
    textAlign: 'center',
    lineHeight: 28,
  },
  cardBody: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
  },
  errorBodyLine: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.coralDark,
    textAlign: 'center',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: Colors.coral,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  outlineButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.coral,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.coralDark,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  noticeBox: {
    backgroundColor: Colors.coralLight,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.coralBorder,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.coralDark,
    textAlign: 'center',
  },
  holdContainer: {
    marginTop: 'auto',
    alignItems: 'stretch',
    paddingVertical: 8,
  },
  holdPill: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.coralDark,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.coralDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.coralSoft,
    zIndex: 0,
  },
  holdButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.coralDark,
    zIndex: 1,
  },
});

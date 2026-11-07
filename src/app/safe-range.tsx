import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';
import { useMonitor } from '../state/hooks';

export default function SafeRangeScreen() {
  const { profile, updateProfile } = useMonitor();
  const [safeRangeM, setSafeRangeM] = useState<number>(profile.safeRangeMeters || 10);
  const [isConnected, setIsConnected] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationSeconds, setCalibrationSeconds] = useState(10);
  const [calibratedDbm, setCalibratedDbm] = useState<number | null>(null);

  // Calibration timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (calibrating && calibrationSeconds > 0) {
      timer = setInterval(() => {
        setCalibrationSeconds((prev) => {
          if (prev <= 1) {
            setCalibrating(false);
            setCalibratedDbm(-61);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [calibrating, calibrationSeconds]);

  const handleDecrease = () => {
    if (safeRangeM > 2) {
      const newM = safeRangeM - 1;
      setSafeRangeM(newM);
      updateProfile({ safeRangeMeters: newM });
    }
  };

  const handleIncrease = () => {
    if (safeRangeM < 50) {
      const newM = safeRangeM + 1;
      setSafeRangeM(newM);
      updateProfile({ safeRangeMeters: newM });
    }
  };

  const handleSelectPreset = (m: number) => {
    setSafeRangeM(m);
    updateProfile({ safeRangeMeters: m });
  };

  const handleStartCalibration = () => {
    if (!isConnected || calibrating) return;
    setCalibrationSeconds(10);
    setCalibrating(true);
  };

  const handleResetCalibration = () => {
    setCalibratedDbm(null);
    setCalibrating(false);
    setCalibrationSeconds(10);
  };

  // Recommendation text
  let recommendation = 'Custom range';
  if (safeRangeM === 5) {
    recommendation = 'Good for: a small room or a shop counter';
  } else if (safeRangeM === 10) {
    recommendation = 'Good for: a home, a classroom or a playground corner';
  } else if (safeRangeM === 20) {
    recommendation = 'Good for: open ground (walls and crowds shorten it a lot)';
  }

  // Calibration body text
  let calibrationBody = 'Signal at 1 m is now -59 dBm (starting value -59). Calibrating on your own phone makes the distance a little more accurate.';
  if (calibrating) {
    calibrationBody = `Keep the wearable exactly 1 m from the phone for ${calibrationSeconds} seconds…`;
  } else if (calibratedDbm !== null) {
    calibrationBody = `Saved: signal at 1 m is ${calibratedDbm} dBm (starting value -59).`;
  }

  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Safe range" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev Connection State Switcher for Calibration */}
        <View style={styles.devMenuCard}>
          <Text style={styles.devTitle}>Dev Connection State Switcher:</Text>
          <View style={styles.devStatesRow}>
            <TouchableOpacity
              style={[styles.devStateBtn, isConnected && styles.devStateBtnActive]}
              onPress={() => setIsConnected(true)}
            >
              <Text style={[styles.devStateText, isConnected && styles.devStateTextActive]}>
                Connected
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.devStateBtn, !isConnected && styles.devStateBtnActiveDanger]}
              onPress={() => setIsConnected(false)}
            >
              <Text style={[styles.devStateText, !isConnected && styles.devStateTextActive]}>
                Disconnected
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Heading 1 */}
        <Text style={styles.heading}>Alert me when the wearable is further than:</Text>

        {/* Preset Chips Row */}
        <View style={styles.chipsRow}>
          {[
            { label: 'Short (5 m)', value: 5 },
            { label: 'Medium (10 m)', value: 10 },
            { label: 'Long (20 m)', value: 20 },
          ].map((preset) => {
            const isSelected = safeRangeM === preset.value;
            return (
              <TouchableOpacity
                key={preset.value}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => handleSelectPreset(preset.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Stepper Card */}
        <View style={styles.stepperCard}>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepBtn, safeRangeM <= 2 && styles.stepBtnDisabled]}
              onPress={handleDecrease}
              disabled={safeRangeM <= 2}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepBtnText, safeRangeM <= 2 && styles.stepBtnTextDisabled]}>−</Text>
            </TouchableOpacity>

            <Text style={styles.bigValueText}>{safeRangeM} m</Text>

            <TouchableOpacity
              style={[styles.stepBtn, safeRangeM >= 50 && styles.stepBtnDisabled]}
              onPress={handleIncrease}
              disabled={safeRangeM >= 50}
              activeOpacity={0.7}
            >
              <Text style={[styles.stepBtnText, safeRangeM >= 50 && styles.stepBtnTextDisabled]}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.recommendationText}>{recommendation}</Text>
        </View>

        {/* Small muted note */}
        <Text style={styles.mutedNote}>
          Distance is approximate. It is estimated from Bluetooth signal strength, which changes with walls, bodies and the phone’s position. Test the range in the places you use it.
        </Text>

        {/* Heading 2 */}
        <Text style={styles.heading}>Calibration (optional)</Text>

        {/* Calibration Card */}
        <View style={styles.card}>
          <Text style={styles.calibrationBody}>{calibrationBody}</Text>

          <TouchableOpacity
            style={[
              styles.outlineButton,
              (!isConnected || calibrating) && styles.buttonDisabled,
            ]}
            onPress={handleStartCalibration}
            activeOpacity={0.85}
            disabled={!isConnected || calibrating}
          >
            {calibrating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color={Colors.textDark} size="small" />
                <Text style={styles.outlineButtonText}>Calibrating…</Text>
              </View>
            ) : (
              <Text style={styles.outlineButtonText}>
                {isConnected ? 'Calibrate at 1 m' : 'Calibrate at 1 m (connect first)'}
              </Text>
            )}
          </TouchableOpacity>

          {calibratedDbm !== null && !calibrating && (
            <TouchableOpacity
              style={styles.textButton}
              onPress={handleResetCalibration}
              activeOpacity={0.7}
            >
              <Text style={styles.textButtonText}>Reset calibration</Text>
            </TouchableOpacity>
          )}
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
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  stepperCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  stepBtn: {
    width: 64,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.sand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
  },
  stepBtnTextDisabled: {
    color: Colors.textMuted,
  },
  bigValueText: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.primary,
    minWidth: 120,
    textAlign: 'center',
  },
  recommendationText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  mutedNote: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  calibrationBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
    lineHeight: 20,
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
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.sand,
  },
  outlineButtonText: {
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: '600',
  },
  textButton: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.coral,
  },
});

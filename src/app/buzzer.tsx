import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';

export default function BuzzerScreen() {
  const [isConnected, setIsConnected] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // 10, 30, 60
  const [ringing, setRinging] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);

  // Countdown effect with cleanup
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (ringing && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setRinging(false);
            return selectedDuration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [ringing, secondsLeft, selectedDuration]);

  const handleStartRing = () => {
    if (!isConnected) return;
    setSecondsLeft(selectedDuration);
    setRinging(true);
  };

  const handleStopRing = () => {
    setRinging(false);
    setSecondsLeft(selectedDuration);
  };

  const handleSelectDuration = (dur: number) => {
    if (ringing) return;
    setSelectedDuration(dur);
    setSecondsLeft(dur);
  };

  const isUnreachable = !isConnected;

  let titleText = 'Ready to ring';
  if (ringing) {
    titleText = `Ringing… ${secondsLeft} s left`;
  } else if (isUnreachable) {
    titleText = 'Cannot reach the wearable';
  }

  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Find child" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev Connection State Switcher */}
        <View style={styles.devMenuCard}>
          <Text style={styles.devTitle}>Dev Connection State Switcher:</Text>
          <View style={styles.devStatesRow}>
            <TouchableOpacity
              style={[styles.devStateBtn, isConnected && styles.devStateBtnActive]}
              onPress={() => {
                setIsConnected(true);
              }}
            >
              <Text style={[styles.devStateText, isConnected && styles.devStateTextActive]}>
                Connected (Reachable)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devStateBtn, !isConnected && styles.devStateBtnActiveDanger]}
              onPress={() => {
                if (ringing) handleStopRing();
                setIsConnected(false);
              }}
            >
              <Text style={[styles.devStateText, !isConnected && styles.devStateTextActive]}>
                Disconnected (Unreachable)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          <Text style={styles.bellEmoji}>{ringing ? '🔔' : '🔕'}</Text>

          <Text style={styles.titleText}>{titleText}</Text>

          {isUnreachable && (
            <Text style={styles.unreachableNote}>
              Move closer to your child. The wearable must be connected.
            </Text>
          )}

          <Text style={styles.durationHeading}>How long</Text>

          {/* Chips Row */}
          <View style={styles.chipsRow}>
            {[10, 30, 60].map((dur) => {
              const isSelected = selectedDuration === dur;
              return (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                    ringing && styles.chipDisabled,
                  ]}
                  onPress={() => handleSelectDuration(dur)}
                  disabled={ringing}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {dur} s
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Button */}
          {!ringing ? (
            <TouchableOpacity
              style={[styles.primaryButton, isUnreachable && styles.buttonDisabled]}
              onPress={handleStartRing}
              activeOpacity={0.85}
              disabled={isUnreachable}
            >
              <Text style={styles.primaryButtonText}>Ring the wearable</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleStopRing}
              activeOpacity={0.85}
            >
              <Text style={styles.dangerButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Small muted note */}
        <Text style={styles.mutedNote}>
          The wearable stops by itself after the chosen time, even if the phone goes out of range.
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
    paddingVertical: 8,
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
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  bellEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
  },
  unreachableNote: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.coral,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  durationHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: Colors.coral,
    borderRadius: 14,
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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

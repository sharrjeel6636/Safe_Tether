/* eslint-disable react-hooks/refs */
// src/components/HoldToConfirm.tsx
// A button that must be held for 1.5 s, so a pocket press cannot dismiss a panic alert.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { PANIC_HOLD_MS } from '../core/constants';
import { colors } from '../ui/theme';

interface Props {
  label: string;
  onConfirmed: () => void;
  holdMs?: number;
}

export function HoldToConfirm({ label, onConfirmed, holdMs = PANIC_HOLD_MS }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const done = useRef(false);

  useEffect(() => () => progress.stopAnimation(), [progress]);

  const start = () => {
    done.current = false;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: holdMs, easing: Easing.linear, useNativeDriver: false }).start(
      ({ finished }) => {
        if (finished && !done.current) {
          done.current = true;
          onConfirmed();
        }
      },
    );
  };
  const cancel = () => {
    if (done.current) return;
    progress.stopAnimation();
    Animated.timing(progress, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  };

  return (
    <Pressable
      onPressIn={start}
      onPressOut={cancel}
      accessibilityRole="button"
      accessibilityHint={`Press and hold for ${(holdMs / 1000).toFixed(1)} seconds`}
    >
      <View style={styles.box} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <Animated.View style={[styles.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, width] }) }]} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.coralDark,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: `${colors.coral}66` },
  label: { fontSize: 16, fontWeight: '700', color: colors.coralDark },
});

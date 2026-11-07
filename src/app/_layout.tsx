import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../theme/tokens';
import { View, StyleSheet } from 'react-native';
import { startRuntime } from '../runtime';

export default function RootLayout() {
  useEffect(() => {
    startRuntime();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.sand },
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="radar" options={{ headerShown: false }} />
          <Stack.Screen name="out-of-range" options={{ headerShown: false }} />
          <Stack.Screen name="panic" options={{ headerShown: false }} />
          <Stack.Screen name="low-battery" options={{ headerShown: false }} />
          <Stack.Screen name="buzzer" options={{ headerShown: false }} />
          <Stack.Screen name="last-location" options={{ headerShown: false }} />
          <Stack.Screen name="connections" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="safe-range" options={{ headerShown: false }} />
          <Stack.Screen name="background-guide" options={{ headerShown: false }} />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
});

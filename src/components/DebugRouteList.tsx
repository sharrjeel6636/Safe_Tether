import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

interface RouteItem {
  name: string;
  path: any;
  description: string;
}

const routes: RouteItem[] = [
  { name: 'Login', path: '/login', description: 'Authentication & account creation' },
  { name: 'Tabs: Home', path: '/(tabs)', description: 'SafeTether home tab' },
  { name: 'Tabs: Alerts', path: '/(tabs)/alerts', description: 'Alerts notification tab' },
  { name: 'Tabs: Settings', path: '/(tabs)/settings', description: 'Settings tab' },
  { name: 'Radar', path: '/radar', description: 'Where is my child' },
  { name: 'Out of Range', path: '/out-of-range', description: 'Out of range alert screen' },
  { name: 'Panic Alert', path: '/panic', description: 'Emergency panic alert (coral theme)' },
  { name: 'Wearable Battery', path: '/low-battery', description: 'Battery level & monitoring' },
  { name: 'Find Child (Buzzer)', path: '/buzzer', description: 'Ring wearable buzzer' },
  { name: 'Last Known Location', path: '/last-location', description: 'Last location coordinates' },
  { name: 'Wearable Connection', path: '/connections', description: 'Bluetooth connection management' },
  { name: 'Child Profile', path: '/profile', description: 'Child profile details' },
  { name: 'Safe Range', path: '/safe-range', description: 'Safety boundary distance configuration' },
  { name: 'Background Guide', path: '/background-guide', description: 'Keep monitoring running guide' },
];

export function DebugRouteList() {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="bug-outline" size={28} color={Colors.primary} />
        <Text style={styles.headerTitle}>Debug Route Navigator</Text>
        <Text style={styles.headerSubtitle}>Tap any route below to open it directly:</Text>
      </View>

      {routes.map((route, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.routeCard}
          onPress={() => router.push(route.path)}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.routeName}>{route.name}</Text>
            <Text style={styles.routePath}>{String(route.path)}</Text>
            <Text style={styles.routeDesc}>{route.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  routePath: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  routeDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

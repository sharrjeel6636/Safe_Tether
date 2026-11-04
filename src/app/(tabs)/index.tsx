import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.placeholderCard}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>SafeTether Dashboard Placeholder</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Links to Stack Screens</Text>
        {[
          { name: 'Radar (Where is my child)', path: '/radar' },
          { name: 'Out of range', path: '/out-of-range' },
          { name: 'Panic alert', path: '/panic' },
          { name: 'Wearable battery', path: '/low-battery' },
          { name: 'Find child', path: '/buzzer' },
          { name: 'Last known location', path: '/last-location' },
          { name: 'Wearable connection', path: '/connections' },
          { name: 'Child profile', path: '/profile' },
          { name: 'Safe range', path: '/safe-range' },
          { name: 'Keep monitoring running', path: '/background-guide' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.linkRow}
            onPress={() => router.push(item.path as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.linkText}>{item.name}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  placeholderCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  sectionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
});

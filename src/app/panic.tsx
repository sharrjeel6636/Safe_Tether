import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';

export default function PanicScreen() {
  return (
    <View style={styles.panicContainer}>
      <AppBar kind="panic" title="Panic alert" />
      <View style={styles.content}>
        <Text style={styles.panicTitle}>Panic alert</Text>
        <Text style={styles.panicSubtitle}>Emergency panic placeholder screen (Coral theme)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panicContainer: { flex: 1, backgroundColor: Colors.panicRed },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  panicTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginBottom: 8 },
  panicSubtitle: { fontSize: 16, color: '#FEE2E2', textAlign: 'center' },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';

export default function BackgroundGuideScreen() {
  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Keep monitoring running" />
      <View style={styles.content}>
        <Text style={styles.title}>Keep monitoring running</Text>
        <Text style={styles.subtitle}>Background guide placeholder screen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textDark, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textMuted },
});

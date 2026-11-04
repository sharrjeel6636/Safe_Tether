import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/tokens';
import { DebugRouteList } from '../components/DebugRouteList';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  const handleUseWithoutAccount = () => {
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="shield" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>SafeTether</Text>
          <Text style={styles.appSubtitle}>Keep your child close, wherever they go</Text>
        </View>

        {!showDebug ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Parent</Text>
            <Text style={styles.cardSubtitle}>Sign in or continue without an account</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="parent@example.com"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleUseWithoutAccount} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Use without an account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.debugToggleButton}
              onPress={() => setShowDebug(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="bug-outline" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.debugToggleText}>Open Debug Route List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.backToLoginBtn}
              onPress={() => setShowDebug(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color={Colors.textDark} style={{ marginRight: 6 }} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
            <DebugRouteList />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 16,
    color: Colors.textDark,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  debugToggleButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  debugToggleText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
});

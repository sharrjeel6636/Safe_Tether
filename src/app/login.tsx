import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/tokens';
import { DebugRouteList } from '../components/DebugRouteList';

const FIREBASE_READY = false;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const validateAndSubmit = (isLogin: boolean) => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      isValid = false;
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    if (isValid) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.replace('/(tabs)');
      }, 800);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'We will send a reset link to your email once cloud login is set up.'
    );
  };

  const handleUseWithoutAccount = () => {
    // Set localOnly or proceed to tabs
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!showDebug ? (
          <View style={styles.contentWrapper}>
            {/* Logo Mark */}
            <View style={styles.logoMarkContainer}>
              <View style={styles.outerRing}>
                <View style={styles.innerRing}>
                  <View style={styles.centerDot} />
                </View>
              </View>
            </View>

            {/* App Name */}
            <Text style={styles.appName}>SafeTether</Text>

            {/* Tagline */}
            <Text style={styles.tagline}>
              Know that your child is close, and get an alert when they are not.
            </Text>

            {!FIREBASE_READY && (
              <View style={styles.warnBanner}>
                <Ionicons name="alert-circle-outline" size={20} color={Colors.warning} style={styles.warnIcon} />
                <Text style={styles.warnText}>
                  Firebase is not set up in this build (google-services.json is missing), so login and cloud backup are not available yet.
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.textInput, emailError ? styles.inputErrorBorder : null]}
                  placeholder="Email"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.textInput, passwordError ? styles.inputErrorBorder : null]}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => validateAndSubmit(true)}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Log in</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => validateAndSubmit(false)}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.outlineButtonText}>Create account</Text>
              </TouchableOpacity>

              <View style={styles.compactLinksRow}>
                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={styles.compactLinkText}>Forgot password</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleUseWithoutAccount} activeOpacity={0.7}>
                  <Text style={styles.compactLinkText}>Use without an account</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              Without an account nothing is uploaded: alerts stay on this phone.
            </Text>

            {/* Debug Navigation Toggle */}
            <TouchableOpacity
              style={styles.debugToggle}
              onPress={() => setShowDebug(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="bug-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.debugToggleText}>Open Debug Route List</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.debugContainer}>
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
    padding: 24,
    justifyContent: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 12,
  },
  logoMarkContainer: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  outerRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.coral,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  warnBanner: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  warnIcon: {
    marginRight: 10,
    alignSelf: 'flex-start',
    marginTop: 1,
  },
  warnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#92400E',
    lineHeight: 18,
  },
  formContainer: {
    width: '100%',
    gap: 12,
  },
  inputGroup: {
    width: '100%',
  },
  textInput: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: Colors.textDark,
  },
  inputErrorBorder: {
    borderColor: Colors.coral,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.coral,
    marginTop: 4,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  compactLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  compactLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  debugToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
    debugToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  debugContainer: {
    width: '100%',
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

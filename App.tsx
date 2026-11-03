import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY_TEAL = '#0D9488';
const TEAL_LIGHT = '#F0FDFA';
const TEAL_BORDER = '#CCFBF1';
const ACCENT_CORAL = '#F43F5E';
const CORAL_LIGHT = '#FFF1F2';
const TEXT_DARK = '#1E293B';
const TEXT_MUTED = '#64748B';
const BG_COLOR = '#F8FAFC';
const CARD_BG = '#FFFFFF';
const ERROR_COLOR = '#EF4444';

export default function App() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Signup Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [signupLoading, setSignupLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleLogin = () => {
    let errors: { email?: string; password?: string } = {};
    if (!loginEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!loginPassword) {
      errors.password = 'Password is required';
    } else if (loginPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setLoginErrors(errors);

    if (Object.keys(errors).length === 0) {
      setLoginLoading(true);
      setSuccessMessage('');
      setTimeout(() => {
        setLoginLoading(false);
        setSuccessMessage('Welcome back to SafeTether! Connecting to your family circle...');
        setTimeout(() => setSuccessMessage(''), 4000);
      }, 1500);
    }
  };

  const handleSignup = () => {
    let errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!signupName.trim()) {
      errors.name = 'Full name is required';
    }

    if (!signupEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(signupEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!signupPassword) {
      errors.password = 'Password is required';
    } else if (signupPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!signupConfirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupPassword !== signupConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setSignupErrors(errors);

    if (Object.keys(errors).length === 0) {
      setSignupLoading(true);
      setSuccessMessage('');
      setTimeout(() => {
        setSignupLoading(false);
        setSuccessMessage('Account created successfully! Welcome to SafeTether.');
        setTimeout(() => setSuccessMessage(''), 4000);
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Branding */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons name="shield-heart" size={36} color={PRIMARY_TEAL} />
            </View>
            <Text style={styles.appName}>SafeTether</Text>
            <Text style={styles.appSubtitle}>Keep your child close, wherever they go</Text>
          </View>

          {/* Success Banner */}
          {successMessage ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color={PRIMARY_TEAL} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Card Container */}
          <View style={styles.card}>
            {/* Segmented Tab Control */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'login' && styles.activeTabButton]}
                onPress={() => {
                  setActiveTab('login');
                  setSuccessMessage('');
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'signup' && styles.activeTabButton]}
                onPress={() => {
                  setActiveTab('signup');
                  setSuccessMessage('');
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* LOGIN FORM */}
            {activeTab === 'login' ? (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      loginErrors.email ? styles.inputErrorBorder : null,
                    ]}
                  >
                    <Ionicons name="mail-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="parent@example.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={loginEmail}
                      onChangeText={(text) => {
                        setLoginEmail(text);
                        if (loginErrors.email) setLoginErrors({ ...loginErrors, email: undefined });
                      }}
                    />
                  </View>
                  {loginErrors.email ? (
                    <Text style={styles.errorText}>{loginErrors.email}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      loginErrors.password ? styles.inputErrorBorder : null,
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showLoginPassword}
                      autoCapitalize="none"
                      value={loginPassword}
                      onChangeText={(text) => {
                        setLoginPassword(text);
                        if (loginErrors.password) setLoginErrors({ ...loginErrors, password: undefined });
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowLoginPassword(!showLoginPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={TEXT_MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                  {loginErrors.password ? (
                    <Text style={styles.errorText}>{loginErrors.password}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={() => alert('Password reset instructions will be sent to your email.')}
                  style={styles.forgotPasswordContainer}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, loginLoading && styles.buttonLoading]}
                  onPress={handleLogin}
                  disabled={loginLoading}
                  activeOpacity={0.85}
                >
                  {loginLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Login to SafeTether</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* CREATE ACCOUNT FORM */
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      signupErrors.name ? styles.inputErrorBorder : null,
                    ]}
                  >
                    <Ionicons name="person-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Sarah Jenkins"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="words"
                      value={signupName}
                      onChangeText={(text) => {
                        setSignupName(text);
                        if (signupErrors.name) setSignupErrors({ ...signupErrors, name: undefined });
                      }}
                    />
                  </View>
                  {signupErrors.name ? (
                    <Text style={styles.errorText}>{signupErrors.name}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      signupErrors.email ? styles.inputErrorBorder : null,
                    ]}
                  >
                    <Ionicons name="mail-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="parent@example.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={signupEmail}
                      onChangeText={(text) => {
                        setSignupEmail(text);
                        if (signupErrors.email) setSignupErrors({ ...signupErrors, email: undefined });
                      }}
                    />
                  </View>
                  {signupErrors.email ? (
                    <Text style={styles.errorText}>{signupErrors.email}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      signupErrors.password ? styles.inputErrorBorder : null,
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="At least 6 characters"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showSignupPassword}
                      autoCapitalize="none"
                      value={signupPassword}
                      onChangeText={(text) => {
                        setSignupPassword(text);
                        if (signupErrors.password) setSignupErrors({ ...signupErrors, password: undefined });
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowSignupPassword(!showSignupPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showSignupPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={TEXT_MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                  {signupErrors.password ? (
                    <Text style={styles.errorText}>{signupErrors.password}</Text>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      signupErrors.confirmPassword ? styles.inputErrorBorder : null,
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showSignupConfirmPassword}
                      autoCapitalize="none"
                      value={signupConfirmPassword}
                      onChangeText={(text) => {
                        setSignupConfirmPassword(text);
                        if (signupErrors.confirmPassword)
                          setSignupErrors({ ...signupErrors, confirmPassword: undefined });
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showSignupConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={TEXT_MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                  {signupErrors.confirmPassword ? (
                    <Text style={styles.errorText}>{signupErrors.confirmPassword}</Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[styles.signupButton, signupLoading && styles.buttonLoading]}
                  onPress={handleSignup}
                  disabled={signupLoading}
                  activeOpacity={0.85}
                >
                  {signupLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.signupButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer Terms */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              By continuing you agree to our{' '}
              <Text
                style={styles.footerLink}
                onPress={() => alert('Terms of Service opened')}
              >
                Terms
              </Text>{' '}
              &{' '}
              <Text
                style={styles.footerLink}
                onPress={() => alert('Privacy Policy opened')}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: TEAL_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: TEAL_BORDER,
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL_LIGHT,
    borderWidth: 1,
    borderColor: TEAL_BORDER,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    color: PRIMARY_TEAL,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: CARD_BG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  activeTabText: {
    color: PRIMARY_TEAL,
    fontWeight: '700',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputErrorBorder: {
    borderColor: ERROR_COLOR,
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_DARK,
  },
  eyeIcon: {
    padding: 6,
  },
  errorText: {
    fontSize: 12,
    color: ERROR_COLOR,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 2,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: PRIMARY_TEAL,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: PRIMARY_TEAL,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signupButton: {
    backgroundColor: ACCENT_CORAL,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ACCENT_CORAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonLoading: {
    opacity: 0.8,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: PRIMARY_TEAL,
    fontWeight: '600',
  },
});

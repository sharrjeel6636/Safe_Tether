import React, { useState, useEffect } from 'react';
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
  Modal,
  Animated,
  Switch,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PRIMARY_TEAL = '#0D9488';
const TEAL_LIGHT = '#F0FDFA';
const TEAL_BORDER = '#CCFBF1';
const ACCENT_CORAL = '#F43F5E';
const CORAL_LIGHT = '#FFF1F2';
const CORAL_BORDER = '#FECDD3';
const TEXT_DARK = '#1E293B';
const TEXT_MUTED = '#64748B';
const BG_COLOR = '#F8FAFC';
const CARD_BG = '#FFFFFF';
const ERROR_COLOR = '#EF4444';
const PANIC_RED = '#991B1B';
const PANIC_RED_LIGHT = '#7F1D1D';

export default function App() {
  // Navigation flow state: 'auth' | 'pairing' | 'dashboard'
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'pairing' | 'dashboard'>('auth');
  const [activeAuthTab, setActiveAuthTab] = useState<'login' | 'signup'>('login');

  // Dynamic User & Child State (No hardcoded dummy names)
  const [parentName, setParentName] = useState('');
  const [childNameInput, setChildNameInput] = useState('');
  const [childName, setChildName] = useState('Your child');
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authErrors, setAuthErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [authLoading, setAuthLoading] = useState(false);

  // Pairing State
  const [pairingState, setPairingState] = useState<'idle' | 'pairing' | 'paired'>('idle');

  // Dashboard / Connection State
  const [connectionState, setConnectionState] = useState<'connected' | 'outOfRange' | 'searching'>('connected');
  const [batteryLevel, setBatteryLevel] = useState(82);

  // Safe Range Settings State (5, 10, or 20 meters)
  const [safeRangePreset, setSafeRangePreset] = useState<number>(10);

  // Alerts Toggle States
  const [alertOutOfRange, setAlertOutOfRange] = useState(true);
  const [alertLowBattery, setAlertLowBattery] = useState(true);
  const [alertPanic, setAlertPanic] = useState(true); // Always on
  const [alertConnectionLost, setAlertConnectionLost] = useState(true);

  // Modals
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [ringingActive, setRingingActive] = useState(false);

  // Main Bottom Navigation Tab ('home' | 'alerts' | 'settings')
  const [mainTab, setMainTab] = useState<'home' | 'alerts' | 'settings'>('home');

  // Alert Screen Mode State ('panic' | 'outOfRange')
  const [alertMode, setAlertMode] = useState<'panic' | 'outOfRange'>('panic');

  // Pulse animation for Panic mode
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleAuthSubmit = () => {
    let errors: { email?: string; password?: string; name?: string } = {};
    if (!authEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(authEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!authPassword) {
      errors.password = 'Password is required';
    } else if (authPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (activeAuthTab === 'signup' && !parentName.trim()) {
      errors.name = 'Full name is required';
    }

    setAuthErrors(errors);

    if (Object.keys(errors).length === 0) {
      setAuthLoading(true);
      if (activeAuthTab === 'signup' && childNameInput.trim()) {
        setChildName(childNameInput.trim());
      }
      setTimeout(() => {
        setAuthLoading(false);
        setCurrentScreen('pairing');
      }, 1200);
    }
  };

  const handleStartPairing = () => {
    if (pairingState === 'paired') {
      setCurrentScreen('dashboard');
      return;
    }

    setPairingState('pairing');
    setTimeout(() => {
      setPairingState('paired');
    }, 2500);
  };

  const childInitial = childName && childName !== 'Your child' ? childName.charAt(0).toUpperCase() : 'C';

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          styles.safeArea,
          alertMode === 'panic' && mainTab === 'alerts' && currentScreen === 'dashboard'
            ? { backgroundColor: PANIC_RED }
            : null,
        ]}
        edges={['top', 'left', 'right']}
      >
        {/* NOTE: STRICTLY NO MOBILE STATUS BAR COMPONENT RENDERING AT TOP */}

        {/* 1. AUTH SCREEN */}
        {currentScreen === 'auth' && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerContainer}>
                <View style={styles.logoBadge}>
                  <MaterialCommunityIcons name="shield-heart" size={36} color={PRIMARY_TEAL} />
                </View>
                <Text style={styles.appName}>SafeTether</Text>
                <Text style={styles.appSubtitle}>Keep your child close, wherever they go</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabButton, activeAuthTab === 'login' && styles.activeTabButton]}
                    onPress={() => {
                      setActiveAuthTab('login');
                      setAuthErrors({});
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, activeAuthTab === 'login' && styles.activeTabText]}>
                      Login
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabButton, activeAuthTab === 'signup' && styles.activeTabButton]}
                    onPress={() => {
                      setActiveAuthTab('signup');
                      setAuthErrors({});
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.tabText, activeAuthTab === 'signup' && styles.activeTabText]}>
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeAuthTab === 'login' ? (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email Address</Text>
                      <View style={[styles.inputWrapper, authErrors.email ? styles.inputErrorBorder : null]}>
                        <Ionicons name="mail-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="parent@example.com"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={authEmail}
                          onChangeText={(text) => {
                            setAuthEmail(text);
                            if (authErrors.email) setAuthErrors({ ...authErrors, email: undefined });
                          }}
                        />
                      </View>
                      {authErrors.email && <Text style={styles.errorText}>{authErrors.email}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <View style={[styles.inputWrapper, authErrors.password ? styles.inputErrorBorder : null]}>
                        <Ionicons name="lock-closed-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="Enter your password"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          value={authPassword}
                          onChangeText={(text) => {
                            setAuthPassword(text);
                            if (authErrors.password) setAuthErrors({ ...authErrors, password: undefined });
                          }}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={TEXT_MUTED} />
                        </TouchableOpacity>
                      </View>
                      {authErrors.password && <Text style={styles.errorText}>{authErrors.password}</Text>}
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryButton, authLoading && styles.buttonLoading]}
                      onPress={handleAuthSubmit}
                      disabled={authLoading}
                      activeOpacity={0.85}
                    >
                      {authLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.primaryButtonText}>Login to SafeTether</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Parent Full Name</Text>
                      <View style={[styles.inputWrapper, authErrors.name ? styles.inputErrorBorder : null]}>
                        <Ionicons name="person-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="Sarah Jenkins"
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="words"
                          value={parentName}
                          onChangeText={(text) => {
                            setParentName(text);
                            if (authErrors.name) setAuthErrors({ ...authErrors, name: undefined });
                          }}
                        />
                      </View>
                      {authErrors.name && <Text style={styles.errorText}>{authErrors.name}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Child's Name</Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons name="happy-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. Leo or Maya (optional)"
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="words"
                          value={childNameInput}
                          onChangeText={setChildNameInput}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email Address</Text>
                      <View style={[styles.inputWrapper, authErrors.email ? styles.inputErrorBorder : null]}>
                        <Ionicons name="mail-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="parent@example.com"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={authEmail}
                          onChangeText={(text) => {
                            setAuthEmail(text);
                            if (authErrors.email) setAuthErrors({ ...authErrors, email: undefined });
                          }}
                        />
                      </View>
                      {authErrors.email && <Text style={styles.errorText}>{authErrors.email}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <View style={[styles.inputWrapper, authErrors.password ? styles.inputErrorBorder : null]}>
                        <Ionicons name="lock-closed-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="At least 6 characters"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          value={authPassword}
                          onChangeText={(text) => {
                            setAuthPassword(text);
                            if (authErrors.password) setAuthErrors({ ...authErrors, password: undefined });
                          }}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={TEXT_MUTED} />
                        </TouchableOpacity>
                      </View>
                      {authErrors.password && <Text style={styles.errorText}>{authErrors.password}</Text>}
                    </View>

                    <TouchableOpacity
                      style={[styles.signupButton, authLoading && styles.buttonLoading]}
                      onPress={handleAuthSubmit}
                      disabled={authLoading}
                      activeOpacity={0.85}
                    >
                      {authLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.signupButtonText}>Create Account</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                  By continuing you agree to our <Text style={styles.footerLink}>Terms</Text> &{' '}
                  <Text style={styles.footerLink}>Privacy Policy</Text>
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {/* 2. WEARABLE PAIRING SCREEN */}
        {currentScreen === 'pairing' && (
          <ScrollView contentContainerStyle={styles.pairingContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
              <View style={styles.logoBadge}>
                <MaterialCommunityIcons name="bluetooth" size={36} color={PRIMARY_TEAL} />
              </View>
              <Text style={styles.appName}>Pair Your Wearable</Text>
              <Text style={styles.appSubtitle}>Connect {childName}'s Bluetooth tether band</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.pairingIllustration}>
                {pairingState === 'paired' ? (
                  <View style={styles.successCheckBadge}>
                    <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                  </View>
                ) : pairingState === 'pairing' ? (
                  <ActivityIndicator size="large" color={PRIMARY_TEAL} />
                ) : (
                  <MaterialCommunityIcons name="watch-variant" size={64} color={PRIMARY_TEAL} />
                )}
                <Text style={styles.pairingStatusTitle}>
                  {pairingState === 'paired'
                    ? 'Wearable Connected!'
                    : pairingState === 'pairing'
                    ? 'Searching for nearby device...'
                    : 'SafeTether Band v2'}
                </Text>
                <Text style={styles.pairingStatusDesc}>
                  {pairingState === 'paired'
                    ? 'Device paired successfully and securely linked.'
                    : pairingState === 'pairing'
                    ? 'Please keep the band close to your phone.'
                    : 'Press below to start pairing via Bluetooth Low Energy.'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.pillButton, pairingState === 'paired' && styles.pillButtonSuccess]}
                onPress={handleStartPairing}
                disabled={pairingState === 'pairing'}
                activeOpacity={0.85}
              >
                {pairingState === 'pairing' ? (
                  <View style={styles.rowCentered}>
                    <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
                    <Text style={styles.pillButtonText}>Connecting...</Text>
                  </View>
                ) : pairingState === 'paired' ? (
                  <Text style={styles.pillButtonText}>Continue to Dashboard</Text>
                ) : (
                  <Text style={styles.pillButtonText}>Start Pairing</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.privacyBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color={PRIMARY_TEAL} style={{ marginRight: 8 }} />
              <Text style={styles.privacyText}>
                A Bluetooth wearable cannot see where a child is; it only tells you how near the child is to your
                phone. Please ensure Bluetooth permissions are enabled.
              </Text>
            </View>
          </ScrollView>
        )}

        {/* 3. DASHBOARD / HOME, ALERTS & SETTINGS TABS */}
        {currentScreen === 'dashboard' && (
          <View style={styles.dashboardRoot}>
            {/* HOME TAB */}
            {mainTab === 'home' && (
              <ScrollView contentContainerStyle={styles.dashboardScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.dashHeaderRow}>
                  <Text style={styles.dashAppTitle}>SafeTether</Text>
                  <View style={styles.simControls}>
                    <TouchableOpacity
                      style={[styles.simBtn, connectionState === 'connected' && styles.simBtnActive]}
                      onPress={() => setConnectionState('connected')}
                    >
                      <Text style={[styles.simText, connectionState === 'connected' && styles.simTextActive]}>
                        Near
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.simBtn, connectionState === 'outOfRange' && styles.simBtnCoralActive]}
                      onPress={() => setConnectionState('outOfRange')}
                    >
                      <Text style={[styles.simText, connectionState === 'outOfRange' && styles.simTextCoralActive]}>
                        Out
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.childProfileBar}>
                  <View style={styles.childAvatarCircle}>
                    <Text style={styles.childAvatarInitial}>{childInitial}</Text>
                  </View>
                  <View style={styles.childInfoContainer}>
                    <Text style={styles.childProfileName}>{childName}</Text>
                    <Text style={styles.childDeviceSubtitle}>SafeTether Band #4029</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      connectionState === 'connected' ? styles.statusPillConnected : styles.statusPillOutOfRange,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        connectionState === 'connected' ? styles.dotConnected : styles.dotOutOfRange,
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        connectionState === 'connected' ? styles.textConnected : styles.textOutOfRange,
                      ]}
                    >
                      {connectionState === 'connected' ? 'Connected' : 'Out of Range'}
                    </Text>
                  </View>
                </View>

                {connectionState === 'outOfRange' && (
                  <TouchableOpacity
                    style={styles.warningBanner}
                    onPress={() => {
                      setAlertMode('outOfRange');
                      setMainTab('alerts');
                    }}
                  >
                    <Ionicons name="warning" size={22} color={ACCENT_CORAL} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.warningTitle}>{childName} is outside the safe range!</Text>
                      <Text style={styles.warningSubtitle}>Tap to open alert notification screen.</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View style={styles.centerIndicatorCard}>
                  <View style={styles.pulseRingOuter}>
                    <View style={styles.pulseRingInner}>
                      <MaterialCommunityIcons name="shield-heart" size={42} color={PRIMARY_TEAL} />
                      <Text style={styles.distanceTypography}>
                        {connectionState === 'outOfRange' ? `> ${safeRangePreset + 5} m` : '4 m'}
                      </Text>
                      <Text style={styles.zoneDescriptorLabel}>
                        {connectionState === 'outOfRange' ? 'Far zone' : 'Near zone'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardFooterInfo}>
                    <Text style={styles.infoBadgeText}>
                      Battery {batteryLevel}% · Safe range {safeRangePreset}m
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.ringWearableButton}
                    onPress={() => {
                      setRingingActive(true);
                      setTimeout(() => setRingingActive(false), 3000);
                    }}
                  >
                    <Ionicons name="notifications" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
                    <Text style={styles.ringButtonText}>
                      {ringingActive ? 'Ringing Wearable...' : 'Find child (ring the wearable)'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.triggerPanicBtn}
                    onPress={() => {
                      setAlertMode('panic');
                      setMainTab('alerts');
                    }}
                  >
                    <Ionicons name="alert-circle" size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
                    <Text style={styles.triggerPanicText}>Test Panic Alert Mode</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* ALERTS TAB: FULL-SCREEN ALERT / PANIC NOTIFICATION SCREEN */}
            {mainTab === 'alerts' && (
              <View
                style={[
                  styles.alertScreenContainer,
                  alertMode === 'panic' ? styles.alertPanicBg : styles.alertRangeBg,
                ]}
              >
                <View style={styles.alertModeSwitcher}>
                  <TouchableOpacity
                    style={[styles.modeSwitchBtn, alertMode === 'panic' && styles.modeSwitchBtnActivePanic]}
                    onPress={() => setAlertMode('panic')}
                  >
                    <Text style={[styles.modeSwitchText, alertMode === 'panic' && styles.modeSwitchTextActive]}>
                      Panic Mode
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeSwitchBtn, alertMode === 'outOfRange' && styles.modeSwitchBtnActiveRange]}
                    onPress={() => setAlertMode('outOfRange')}
                  >
                    <Text
                      style={[
                        styles.modeSwitchText,
                        alertMode === 'outOfRange' && styles.modeSwitchTextActiveRange,
                      ]}
                    >
                      Out of Range
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.alertScrollContent} showsVerticalScrollIndicator={false}>
                  {alertMode === 'panic' ? (
                    <View style={styles.panicContentContainer}>
                      <Animated.View style={[styles.panicPulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                        <Ionicons name="warning" size={56} color="#FFFFFF" />
                      </Animated.View>

                      <Text style={styles.panicTitle}>PANIC ALERT</Text>
                      <Text style={styles.panicSubtitle}>{childName} · Emergency button pressed</Text>

                      <View style={styles.panicMetadataBox}>
                        <View style={styles.metaRow}>
                          <Ionicons name="time-outline" size={16} color="#FCA5A5" style={{ marginRight: 6 }} />
                          <Text style={styles.metaText}>Triggered just now (10:48 AM)</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Ionicons name="location-outline" size={16} color="#FCA5A5" style={{ marginRight: 6 }} />
                          <Text style={styles.metaText}>Approx. distance: ~18 meters away</Text>
                        </View>
                      </View>

                      <View style={styles.alertActionButtons}>
                        <TouchableOpacity
                          style={styles.panicPrimaryButton}
                          onPress={() => alert("Navigating to live radar tracking - 'I'm Coming' initiated!")}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="navigate" size={22} color={PANIC_RED} style={{ marginRight: 8 }} />
                          <Text style={styles.panicPrimaryButtonText}>I'm Coming</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.panicSecondaryButton}
                          onPress={() => alert('Dialing emergency services...')}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="call" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                          <Text style={styles.panicSecondaryButtonText}>Call Emergency</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.rangeContentContainer}>
                      <View style={styles.rangeBadgeIcon}>
                        <MaterialCommunityIcons name="signal-off" size={40} color={ACCENT_CORAL} />
                      </View>

                      <Text style={styles.rangeTitle}>Child is out of safe range</Text>
                      <Text style={styles.rangeSubtitle}>
                        {childName} has exceeded the {safeRangePreset}m safety boundary.
                      </Text>

                      <View style={styles.rangeMetadataCard}>
                        <View style={styles.metaRow}>
                          <Ionicons name="radio" size={16} color={TEXT_MUTED} style={{ marginRight: 6 }} />
                          <Text style={styles.rangeMetaText}>Distance: about 12 m</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Ionicons name="time-outline" size={16} color={TEXT_MUTED} style={{ marginRight: 6 }} />
                          <Text style={styles.rangeMetaText}>Last signal: 12 seconds ago</Text>
                        </View>
                      </View>

                      <View style={styles.alertActionButtons}>
                        <TouchableOpacity
                          style={styles.rangePrimaryButton}
                          onPress={() => {
                            setRingingActive(true);
                            setTimeout(() => setRingingActive(false), 3000);
                          }}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="notifications" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                          <Text style={styles.rangePrimaryButtonText}>
                            {ringingActive ? 'Ringing Wearable...' : 'Find child (ring the wearable)'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.rangeSecondaryButton}
                          onPress={() => setMainTab('home')}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.rangeSecondaryButtonText}>Dismiss</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {/* SETTINGS TAB: SAFE RANGE & SETTINGS SCREEN */}
            {mainTab === 'settings' && (
              <ScrollView contentContainerStyle={styles.settingsScrollContent} showsVerticalScrollIndicator={false}>
                {/* 1. Header Section */}
                <View style={styles.settingsSubHeader}>
                  <TouchableOpacity
                    style={styles.backArrowBtn}
                    onPress={() => setMainTab('home')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chevron-back" size={24} color={TEXT_DARK} />
                  </TouchableOpacity>
                  <Text style={styles.settingsScreenTitle}>Safe Range & Settings</Text>
                </View>

                {/* 2. Section 1: Safe Range Settings */}
                <View style={styles.settingsSectionCard}>
                  <Text style={styles.sectionHeaderTitle}>Safe range</Text>
                  <Text style={styles.sectionHeaderSubtitle}>Alert me when the wearable is further than:</Text>

                  <View style={styles.presetCardsContainer}>
                    {[
                      { meters: 5, label: 'Short', desc: '5 meters' },
                      { meters: 10, label: 'Medium', desc: '10 meters' },
                      { meters: 20, label: 'Long', desc: '20 meters' },
                    ].map((preset) => {
                      const isSelected = safeRangePreset === preset.meters;
                      return (
                        <TouchableOpacity
                          key={preset.meters}
                          style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                          onPress={() => setSafeRangePreset(preset.meters)}
                          activeOpacity={0.85}
                        >
                          <View style={styles.presetCardTopRow}>
                            <Text style={[styles.presetCardLabel, isSelected && styles.presetCardLabelSelected]}>
                              {preset.label}
                            </Text>
                            {isSelected && <Ionicons name="checkmark-circle" size={20} color={PRIMARY_TEAL} />}
                          </View>
                          <Text style={[styles.presetCardDesc, isSelected && styles.presetCardDescSelected]}>
                            {preset.desc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.helperNoteText}>
                    Distance is approximate and based on Bluetooth signal strength, which changes with walls, bodies and
                    the phone's position.
                  </Text>
                </View>

                {/* 3. Section 2: Alerts & Notifications */}
                <View style={styles.settingsSectionCard}>
                  <Text style={styles.sectionHeaderTitle}>Alerts</Text>

                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.toggleRowTitle}>Out of range alerts</Text>
                      <Text style={styles.toggleRowDesc}>Notify when {childName} leaves the safety boundary</Text>
                    </View>
                    <Switch
                      value={alertOutOfRange}
                      onValueChange={setAlertOutOfRange}
                      trackColor={{ false: '#CBD5E1', true: TEAL_BORDER }}
                      thumbColor={alertOutOfRange ? PRIMARY_TEAL : '#F1F5F9'}
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.toggleRowTitle}>Low battery alerts</Text>
                      <Text style={styles.toggleRowDesc}>Notify when band battery drops below 20%</Text>
                    </View>
                    <Switch
                      value={alertLowBattery}
                      onValueChange={setAlertLowBattery}
                      trackColor={{ false: '#CBD5E1', true: TEAL_BORDER }}
                      thumbColor={alertLowBattery ? PRIMARY_TEAL : '#F1F5F9'}
                    />
                  </View>

                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.toggleRowTitle}>Panic alerts</Text>
                      <Text style={styles.toggleRowDesc}>Always on loud sound & vibration for emergencies</Text>
                    </View>
                    <Switch
                      value={alertPanic}
                      onValueChange={setAlertPanic}
                      disabled={true} // Always on
                      trackColor={{ false: '#CBD5E1', true: TEAL_BORDER }}
                      thumbColor={PRIMARY_TEAL}
                    />
                  </View>

                  <View style={[styles.toggleRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.toggleRowTitle}>Connection lost alerts</Text>
                      <Text style={styles.toggleRowDesc}>Notify if Bluetooth signal is interrupted</Text>
                    </View>
                    <Switch
                      value={alertConnectionLost}
                      onValueChange={setAlertConnectionLost}
                      trackColor={{ false: '#CBD5E1', true: TEAL_BORDER }}
                      thumbColor={alertConnectionLost ? PRIMARY_TEAL : '#F1F5F9'}
                    />
                  </View>
                </View>

                {/* 4. Section 3: Connected Device */}
                <View style={styles.settingsSectionCard}>
                  <Text style={styles.sectionHeaderTitle}>Device</Text>

                  <View style={styles.deviceCardBox}>
                    <View style={styles.deviceIconBadge}>
                      <MaterialCommunityIcons name="watch-variant" size={28} color={PRIMARY_TEAL} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.deviceNameText}>SafeTether wearable</Text>
                      <Text style={styles.deviceMacText}>24:6F:28:AB:12:3D · {batteryLevel}% Battery</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.unpairButton}
                    onPress={() => alert('Device unpaired successfully.')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={18} color={ACCENT_CORAL} style={{ marginRight: 8 }} />
                    <Text style={styles.unpairButtonText}>Unpair Device</Text>
                  </TouchableOpacity>
                </View>

                {/* 5. Section 4: App Information & System */}
                <View style={[styles.settingsSectionCard, { marginBottom: 40 }]}>
                  <Text style={styles.sectionHeaderTitle}>App</Text>

                  <TouchableOpacity
                    style={styles.appLinkRow}
                    onPress={() => alert('Opening Background Monitoring Guide')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.appLinkText}>Keep monitoring running</Text>
                    <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.appLinkRow}
                    onPress={() => alert('Opening Privacy Policy & Terms')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.appLinkText}>Privacy Policy & Terms</Text>
                    <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
                  </TouchableOpacity>

                  <View style={[styles.appLinkRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.appLinkText}>App Version</Text>
                    <Text style={styles.appVersionText}>v1.0.0</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomNavBar}>
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => setMainTab('home')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={mainTab === 'home' ? 'home' : 'home-outline'}
                  size={24}
                  color={mainTab === 'home' ? PRIMARY_TEAL : TEXT_MUTED}
                />
                <Text style={[styles.navText, mainTab === 'home' && styles.navTextActive]}>
                  Home
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => setMainTab('alerts')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={mainTab === 'alerts' ? 'notifications' : 'notifications-outline'}
                  size={24}
                  color={mainTab === 'alerts' ? (alertMode === 'panic' && mainTab === 'alerts' ? '#FFFFFF' : PRIMARY_TEAL) : TEXT_MUTED}
                />
                <Text
                  style={[
                    styles.navText,
                    mainTab === 'alerts' && styles.navTextActive,
                    alertMode === 'panic' && mainTab === 'alerts' && { color: '#FFFFFF' },
                  ]}
                >
                  Alerts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => setMainTab('settings')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={mainTab === 'settings' ? 'settings' : 'settings-outline'}
                  size={24}
                  color={mainTab === 'settings' ? PRIMARY_TEAL : TEXT_MUTED}
                />
                <Text style={[styles.navText, mainTab === 'settings' && styles.navTextActive]}>
                  Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
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
  pairingContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
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
    textAlign: 'center',
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
  pairingIllustration: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successCheckBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY_TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pairingStatusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  pairingStatusDesc: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  pillButton: {
    backgroundColor: PRIMARY_TEAL,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  pillButtonSuccess: {
    backgroundColor: PRIMARY_TEAL,
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyBox: {
    flexDirection: 'row',
    backgroundColor: TEAL_LIGHT,
    borderWidth: 1,
    borderColor: TEAL_BORDER,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    alignItems: 'flex-start',
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_DARK,
    lineHeight: 18,
  },

  /* DASHBOARD STYLES */
  dashboardRoot: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  dashboardScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  dashHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashAppTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  simControls: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
  },
  simBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  simBtnActive: {
    backgroundColor: PRIMARY_TEAL,
  },
  simBtnCoralActive: {
    backgroundColor: ACCENT_CORAL,
  },
  simText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  simTextActive: {
    color: '#FFFFFF',
  },
  childProfileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  childAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TEAL_LIGHT,
    borderWidth: 1,
    borderColor: TEAL_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: PRIMARY_TEAL,
  },
  childInfoContainer: {
    flex: 1,
  },
  childProfileName: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  childDeviceSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillConnected: {
    backgroundColor: TEAL_LIGHT,
    borderColor: TEAL_BORDER,
  },
  statusPillOutOfRange: {
    backgroundColor: CORAL_LIGHT,
    borderColor: CORAL_BORDER,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotConnected: {
    backgroundColor: PRIMARY_TEAL,
  },
  dotOutOfRange: {
    backgroundColor: ACCENT_CORAL,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textConnected: {
    color: PRIMARY_TEAL,
  },
  textOutOfRange: {
    color: ACCENT_CORAL,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CORAL_LIGHT,
    borderWidth: 1,
    borderColor: CORAL_BORDER,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: ACCENT_CORAL,
  },
  warningSubtitle: {
    fontSize: 12,
    color: '#881337',
    marginTop: 2,
  },
  centerIndicatorCard: {
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  pulseRingOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: TEAL_LIGHT,
    borderWidth: 2,
    borderColor: TEAL_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulseRingInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceTypography: {
    fontSize: 36,
    fontWeight: '900',
    color: PRIMARY_TEAL,
    marginTop: 4,
  },
  zoneDescriptorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  cardFooterInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  actionsContainer: {
    width: '100%',
  },
  ringWearableButton: {
    flexDirection: 'row',
    backgroundColor: ACCENT_CORAL,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ringButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  triggerPanicBtn: {
    flexDirection: 'row',
    backgroundColor: PANIC_RED,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  triggerPanicText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: CARD_BG,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: PRIMARY_TEAL,
    fontWeight: '700',
  },

  /* ALERT SCREEN STYLES */
  alertScreenContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 90,
  },
  alertPanicBg: {
    backgroundColor: PANIC_RED,
  },
  alertRangeBg: {
    backgroundColor: '#FEF2F2',
  },
  alertModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeSwitchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeSwitchBtnActivePanic: {
    backgroundColor: '#FFFFFF',
  },
  modeSwitchBtnActiveRange: {
    backgroundColor: ACCENT_CORAL,
  },
  modeSwitchText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modeSwitchTextActive: {
    color: PANIC_RED,
  },
  modeSwitchTextActiveRange: {
    color: '#FFFFFF',
  },
  alertScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  panicContentContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  panicPulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PANIC_RED_LIGHT,
    borderWidth: 4,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  panicTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  panicSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FEE2E2',
    textAlign: 'center',
    marginBottom: 24,
  },
  panicMetadataBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#FEE2E2',
    fontWeight: '500',
  },
  alertActionButtons: {
    width: '100%',
  },
  panicPrimaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  panicPrimaryButtonText: {
    color: PANIC_RED,
    fontSize: 16,
    fontWeight: '800',
  },
  panicSecondaryButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panicSecondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rangeContentContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    backgroundColor: CARD_BG,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: CORAL_BORDER,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  rangeBadgeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: CORAL_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CORAL_BORDER,
  },
  rangeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 6,
  },
  rangeSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  rangeMetadataCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rangeMetaText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  rangePrimaryButton: {
    flexDirection: 'row',
    backgroundColor: ACCENT_CORAL,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: ACCENT_CORAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rangePrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rangeSecondaryButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeSecondaryButtonText: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: '600',
  },

  /* SAFE RANGE & SETTINGS SCREEN STYLES */
  settingsScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  settingsSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 12,
  },
  settingsScreenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  settingsSectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 16,
  },
  presetCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  presetCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  presetCardSelected: {
    borderColor: PRIMARY_TEAL,
    backgroundColor: TEAL_LIGHT,
  },
  presetCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  presetCardLabelSelected: {
    color: PRIMARY_TEAL,
  },
  presetCardDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  presetCardDescSelected: {
    color: PRIMARY_TEAL,
    fontWeight: '600',
  },
  helperNoteText: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  toggleRowDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  deviceCardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deviceIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TEAL_BORDER,
  },
  deviceNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  deviceMacText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  unpairButton: {
    flexDirection: 'row',
    backgroundColor: CORAL_LIGHT,
    borderWidth: 1,
    borderColor: CORAL_BORDER,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unpairButtonText: {
    color: ACCENT_CORAL,
    fontSize: 15,
    fontWeight: '700',
  },
  appLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  appLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  appVersionText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
});

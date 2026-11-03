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
  Modal,
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
const SUCCESS_COLOR = '#10B981';

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

  // Dashboard / Connection State ('connected' | 'outOfRange' | 'searching')
  const [connectionState, setConnectionState] = useState<'connected' | 'outOfRange' | 'searching'>('connected');
  const [batteryLevel, setBatteryLevel] = useState(82);
  const [safeRangeLimit, setSafeRangeLimit] = useState(10); // meters

  // Modals
  const [safeRangeModalVisible, setSafeRangeModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [ringingActive, setRingingActive] = useState(false);

  // Main Bottom Navigation Tab ('home' | 'alerts' | 'settings')
  const [mainTab, setMainTab] = useState<'home' | 'alerts' | 'settings'>('home');

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
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
                  By continuing you agree to our <Text style={styles.footerLink}>Terms</Text> & <Text style={styles.footerLink}>Privacy Policy</Text>
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
                style={[
                  styles.pillButton,
                  pairingState === 'paired' && styles.pillButtonSuccess,
                ]}
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
                A Bluetooth wearable cannot see where a child is; it only tells you how near the child is to your phone. Please ensure Bluetooth permissions are enabled.
              </Text>
            </View>
          </ScrollView>
        )}

        {/* 3. HOME DASHBOARD SCREEN (MAIN APP) */}
        {currentScreen === 'dashboard' && (
          <View style={styles.dashboardRoot}>
            <ScrollView
              contentContainerStyle={styles.dashboardScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* App Header & Child Profile Section */}
              <View style={styles.dashHeaderRow}>
                <Text style={styles.dashAppTitle}>SafeTether</Text>
                
                {/* State Simulator Badge (Allows testing Connected, Out of Range, Searching) */}
                <View style={styles.simControls}>
                  <TouchableOpacity
                    style={[styles.simBtn, connectionState === 'connected' && styles.simBtnActive]}
                    onPress={() => setConnectionState('connected')}
                  >
                    <Text style={[styles.simText, connectionState === 'connected' && styles.simTextActive]}>Near</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.simBtn, connectionState === 'outOfRange' && styles.simBtnCoralActive]}
                    onPress={() => setConnectionState('outOfRange')}
                  >
                    <Text style={[styles.simText, connectionState === 'outOfRange' && styles.simTextCoralActive]}>Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.simBtn, connectionState === 'searching' && styles.simBtnGrayActive]}
                    onPress={() => setConnectionState('searching')}
                  >
                    <Text style={[styles.simText, connectionState === 'searching' && styles.simTextGrayActive]}>Search</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Child Profile Bar */}
              <View style={styles.childProfileBar}>
                <View style={styles.childAvatarCircle}>
                  <Text style={styles.childAvatarInitial}>{childInitial}</Text>
                </View>
                <View style={styles.childInfoContainer}>
                  <Text style={styles.childProfileName}>{childName}</Text>
                  <Text style={styles.childDeviceSubtitle}>SafeTether Band #4029</Text>
                </View>

                {/* Connection Status Pill Badge */}
                <View
                  style={[
                    styles.statusPill,
                    connectionState === 'connected'
                      ? styles.statusPillConnected
                      : connectionState === 'outOfRange'
                      ? styles.statusPillOutOfRange
                      : styles.statusPillSearching,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      connectionState === 'connected'
                        ? styles.dotConnected
                        : connectionState === 'outOfRange'
                        ? styles.dotOutOfRange
                        : styles.dotSearching,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      connectionState === 'connected'
                        ? styles.textConnected
                        : connectionState === 'outOfRange'
                        ? styles.textOutOfRange
                        : styles.textSearching,
                    ]}
                  >
                    {connectionState === 'connected'
                      ? 'Connected'
                      : connectionState === 'outOfRange'
                      ? 'Out of Range'
                      : 'Searching'}
                  </Text>
                </View>
              </View>

              {/* Warning Banner when Out of Range / Low Battery */}
              {connectionState === 'outOfRange' && (
                <View style={styles.warningBanner}>
                  <Ionicons name="warning" size={22} color={ACCENT_CORAL} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.warningTitle}>{childName} is outside the safe range!</Text>
                    <Text style={styles.warningSubtitle}>Tap below to check last known location or reconnect.</Text>
                  </View>
                </View>
              )}

              {batteryLevel < 20 && (
                <View style={[styles.warningBanner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                  <Ionicons name="battery-dead" size={22} color="#D97706" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.warningTitle, { color: '#92400E' }]}>Wearable battery is low ({batteryLevel}%)</Text>
                    <Text style={[styles.warningSubtitle, { color: '#B45309' }]}>Please recharge the SafeTether band soon.</Text>
                  </View>
                </View>
              )}

              {/* Center Circular Distance Indicator (Main Focus) */}
              <View
                style={[
                  styles.centerIndicatorCard,
                  connectionState === 'outOfRange' && styles.cardOutOfRangeBorder,
                ]}
              >
                <View
                  style={[
                    styles.pulseRingOuter,
                    connectionState === 'outOfRange' && styles.pulseRingCoral,
                  ]}
                >
                  <View style={styles.pulseRingInner}>
                    <MaterialCommunityIcons
                      name={connectionState === 'outOfRange' ? 'signal-off' : 'shield-heart'}
                      size={42}
                      color={connectionState === 'outOfRange' ? ACCENT_CORAL : PRIMARY_TEAL}
                    />
                    <Text style={[styles.distanceTypography, connectionState === 'outOfRange' && { color: ACCENT_CORAL }]}>
                      {connectionState === 'outOfRange'
                        ? `> ${safeRangeLimit + 5} m`
                        : connectionState === 'searching'
                        ? '--'
                        : `${Math.min(4, safeRangeLimit - 2)} m`}
                    </Text>
                    <Text style={styles.zoneDescriptorLabel}>
                      {connectionState === 'outOfRange'
                        ? 'Far zone (Disconnected)'
                        : connectionState === 'searching'
                        ? 'Searching for signal...'
                        : 'Near zone'}
                    </Text>
                  </View>
                </View>

                {/* Footer details inside card */}
                <View style={styles.cardFooterInfo}>
                  <View style={styles.infoBadgeItem}>
                    <Ionicons
                      name={batteryLevel < 20 ? 'battery-dead' : 'battery-charging'}
                      size={18}
                      color={batteryLevel < 20 ? ACCENT_CORAL : PRIMARY_TEAL}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.infoBadgeText}>Battery {batteryLevel}%</Text>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoBadgeItem}>
                    <Ionicons name="time-outline" size={18} color={TEXT_MUTED} style={{ marginRight: 6 }} />
                    <Text style={styles.infoBadgeText}>
                      Safe range {safeRangeLimit} m · last signal 3s ago
                    </Text>
                  </View>
                </View>
              </View>

              {/* Big Action Buttons at the Bottom */}
              <View style={styles.actionsContainer}>
                {/* Primary Action Button 1: Find child (ring wearable) */}
                <TouchableOpacity
                  style={styles.ringWearableButton}
                  onPress={() => {
                    setRingingActive(true);
                    setTimeout(() => setRingingActive(false), 3000);
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={ringingActive ? 'volume-high' : 'notifications'}
                    size={22}
                    color="#FFFFFF"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.ringButtonText}>
                    {ringingActive ? 'Ringing Wearable...' : 'Find child (ring the wearable)'}
                  </Text>
                </TouchableOpacity>

                {/* Primary Action Button 2: Safe Range */}
                <TouchableOpacity
                  style={styles.safeRangeButton}
                  onPress={() => setSafeRangeModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="radio-outline" size={22} color={PRIMARY_TEAL} style={{ marginRight: 10 }} />
                  <Text style={styles.safeRangeButtonText}>Safe range settings ({safeRangeLimit}m)</Text>
                </TouchableOpacity>

                {/* Two Additional Utility Buttons */}
                <View style={styles.utilityRow}>
                  <TouchableOpacity
                    style={styles.utilityButtonHalf}
                    onPress={() => setLocationModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="location-outline" size={20} color={TEXT_DARK} style={{ marginRight: 8 }} />
                    <Text style={styles.utilityButtonText}>Last known location</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.utilityButtonHalf, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}
                    onPress={() => alert('Monitoring stopped for this session.')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="power-outline" size={20} color={ACCENT_CORAL} style={{ marginRight: 8 }} />
                    <Text style={[styles.utilityButtonText, { color: ACCENT_CORAL }]}>Stop monitoring</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* 5. Bottom Navigation Bar */}
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
                  color={mainTab === 'alerts' ? PRIMARY_TEAL : TEXT_MUTED}
                />
                <Text style={[styles.navText, mainTab === 'alerts' && styles.navTextActive]}>
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

            {/* Safe Range Settings Modal */}
            <Modal
              visible={safeRangeModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setSafeRangeModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContentCard}>
                  <Text style={styles.modalTitle}>Safe Range Settings</Text>
                  <Text style={styles.modalSubtitle}>
                    Choose the maximum distance allowed before alerting you that {childName} is out of range.
                  </Text>

                  {[5, 10, 15, 25].map((meters) => (
                    <TouchableOpacity
                      key={meters}
                      style={[
                        styles.rangeOptionItem,
                        safeRangeLimit === meters && styles.rangeOptionSelected,
                      ]}
                      onPress={() => {
                        setSafeRangeLimit(meters);
                        setSafeRangeModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.rangeOptionText,
                          safeRangeLimit === meters && styles.rangeOptionTextSelected,
                        ]}
                      >
                        {meters} Meters ({meters === 5 ? 'Very Close' : meters === 10 ? 'Standard' : 'Extended'})
                      </Text>
                      {safeRangeLimit === meters && (
                        <Ionicons name="checkmark-circle" size={20} color={PRIMARY_TEAL} />
                      )}
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setSafeRangeModalVisible(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Last Known Location Modal */}
            <Modal
              visible={locationModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setLocationModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContentCard}>
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <View style={[styles.logoBadge, { backgroundColor: TEAL_LIGHT }]}>
                      <Ionicons name="location" size={32} color={PRIMARY_TEAL} />
                    </View>
                    <Text style={styles.modalTitle}>Last Known Location</Text>
                    <Text style={styles.modalSubtitle}>
                      {childName}'s band was last detected near your paired smartphone at home Wi-Fi zone.
                    </Text>
                  </View>

                  <View style={styles.locationDetailBox}>
                    <Text style={styles.locationCoords}>📍 Lat: 37.7749° N, Lon: 122.4194° W</Text>
                    <Text style={styles.locationTime}>Synced 3 seconds ago via Bluetooth LE</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setLocationModalVisible(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
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
    letterSpacing: 0.5,
  },
  simControls: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
  },
  simBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  simBtnActive: {
    backgroundColor: PRIMARY_TEAL,
  },
  simBtnCoralActive: {
    backgroundColor: ACCENT_CORAL,
  },
  simBtnGrayActive: {
    backgroundColor: TEXT_MUTED,
  },
  simText: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  simTextActive: {
    color: '#FFFFFF',
  },
  simTextCoralActive: {
    color: '#FFFFFF',
  },
  simTextGrayActive: {
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
  statusPillSearching: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
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
  dotSearching: {
    backgroundColor: TEXT_MUTED,
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
  textSearching: {
    color: TEXT_MUTED,
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  cardOutOfRangeBorder: {
    borderColor: CORAL_BORDER,
    backgroundColor: '#FFFDFD',
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
  pulseRingCoral: {
    backgroundColor: CORAL_LIGHT,
    borderColor: CORAL_BORDER,
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
    letterSpacing: -1,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  infoDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
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
    shadowColor: ACCENT_CORAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 12,
  },
  ringButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  safeRangeButton: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderWidth: 2,
    borderColor: PRIMARY_TEAL,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  safeRangeButtonText: {
    color: PRIMARY_TEAL,
    fontSize: 16,
    fontWeight: '700',
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  utilityButtonHalf: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  utilityButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  rangeOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  rangeOptionSelected: {
    borderColor: PRIMARY_TEAL,
    backgroundColor: TEAL_LIGHT,
  },
  rangeOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  rangeOptionTextSelected: {
    color: PRIMARY_TEAL,
    fontWeight: '700',
  },
  modalCloseButton: {
    backgroundColor: PRIMARY_TEAL,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  locationDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    alignItems: 'center',
  },
  locationCoords: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/tokens';
import { appState, setLocalOnly } from '../../mock/data';

function CustomSwitch({ value, onValueChange }: { value: boolean; onValueChange: (val: boolean) => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onValueChange(!value)}
      style={[
        styles.switchPill,
        { backgroundColor: value ? Colors.primary : Colors.border },
      ]}
    >
      <View style={[styles.switchThumb, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </TouchableOpacity>
  );
}

export default function SettingsTabScreen() {
  // Settings states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsAllowed, setNotificationsAllowed] = useState(true);
  const [batteryOptimisationOff, setBatteryOptimisationOff] = useState(true);
  const [isLocalOnly, setIsLocalOnly] = useState(appState.localOnly);

  // Delete account modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleLocalOnly = () => {
    const next = !isLocalOnly;
    setIsLocalOnly(next);
    setLocalOnly(next);
  };

  const handleLogOutPress = () => {
    Alert.alert(
      isLocalOnly ? 'Leave and clear this phone' : 'Log out',
      'Monitoring will stop on this phone. Your alerts stay in your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isLocalOnly ? 'Clear & Leave' : 'Log out',
          style: 'destructive',
          onPress: () => {
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (!password) return;
    if (password.length < 4) {
      setDeleteError('Incorrect password. Please try again.');
      return;
    }
    setDeleteError('');
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      setPassword('');
      router.replace('/login');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dev State Switcher for testing all states easily */}
        <View style={styles.devMenuCard}>
          <Text style={styles.devTitle}>Dev State Switcher:</Text>
          <View style={styles.devStatesRow}>
            <TouchableOpacity
              style={[styles.devStateBtn, isLocalOnly && styles.devStateBtnActive]}
              onPress={handleToggleLocalOnly}
            >
              <Text style={[styles.devStateText, isLocalOnly && styles.devStateTextActive]}>
                {isLocalOnly ? 'Local-Only Mode' : 'Account Mode'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devStateBtn, !notificationsAllowed && styles.devStateBtnActive]}
              onPress={() => setNotificationsAllowed(!notificationsAllowed)}
            >
              <Text style={[styles.devStateText, !notificationsAllowed && styles.devStateTextActive]}>
                {notificationsAllowed ? 'Notifs Allowed' : 'Notifs Blocked'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devStateBtn, !batteryOptimisationOff && styles.devStateBtnActive]}
              onPress={() => setBatteryOptimisationOff(!batteryOptimisationOff)}
            >
              <Text style={[styles.devStateText, !batteryOptimisationOff && styles.devStateTextActive]}>
                {batteryOptimisationOff ? 'Battery OK' : 'Battery Needs Attention'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card 1: Panic alert (gap 4) */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Panic alert</Text>
          <Text style={styles.smallMuted}>
            Always on: loud sound and vibration. It cannot be switched off.
          </Text>
        </View>

        {/* Card 2: Three rows with switches (no gap inside card between rows) */}
        <View style={styles.cardNoGap}>
          {/* Row 1: Sound */}
          <View style={styles.rowItem}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowHeading}>Sound</Text>
              <Text style={styles.smallMuted}>For range, connection and battery alerts</Text>
            </View>
            <CustomSwitch value={soundEnabled} onValueChange={setSoundEnabled} />
          </View>

          {/* Row 2: Vibration */}
          <View style={[styles.rowItem, styles.rowBorderTop]}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowHeading}>Vibration</Text>
              <Text style={styles.smallMuted}>For range, connection and battery alerts</Text>
            </View>
            <CustomSwitch value={vibrationEnabled} onValueChange={setVibrationEnabled} />
          </View>

          {/* Row 3: Notifications */}
          <View style={[styles.rowItem, styles.rowBorderTop]}>
            <View style={styles.rowTextContainer}>
              <Text style={styles.rowHeading}>Notifications</Text>
              {notificationsAllowed ? (
                <Text style={styles.smallMuted}>Allowed</Text>
              ) : (
                <View style={styles.notifAlertRow}>
                  <Text style={styles.errorTextMuted}>Not allowed: alerts cannot reach you</Text>
                  <TouchableOpacity
                    style={styles.compactPrimaryBtn}
                    onPress={() => setNotificationsAllowed(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.compactPrimaryBtnText}>Allow</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <CustomSwitch value={notificationsAllowed} onValueChange={setNotificationsAllowed} />
          </View>
        </View>

        {/* Configuration Outline Buttons */}
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.push('/safe-range')}
          activeOpacity={0.85}
        >
          <Text style={styles.outlineButtonText}>Safe range: 10 m</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.push('/profile')}
          activeOpacity={0.85}
        >
          <Text style={styles.outlineButtonText}>Child profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.push('/connections')}
          activeOpacity={0.85}
        >
          <Text style={styles.outlineButtonText}>Wearable connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.push('/background-guide')}
          activeOpacity={0.85}
        >
          <Text style={styles.outlineButtonText}>Keep monitoring running</Text>
        </TouchableOpacity>

        {/* Battery optimisation status */}
        <Text style={[styles.smallMutedCenter, !batteryOptimisationOff && styles.warningText]}>
          {batteryOptimisationOff
            ? 'Battery optimisation is off for this app'
            : 'Needs attention: battery optimisation is on for this app'}
        </Text>

        {/* Account Section */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Account</Text>
          <Text style={styles.bodyText}>
            {isLocalOnly
              ? 'Using SafeTether without an account: alerts stay on this phone.'
              : 'parent@example.com'}
          </Text>

          <View style={styles.accountButtonContainer}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleLogOutPress}
              activeOpacity={0.85}
            >
              <Text style={styles.outlineButtonText}>
                {isLocalOnly ? 'Leave and clear this phone' : 'Log out'}
              </Text>
            </TouchableOpacity>

            {!isLocalOnly && (
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={() => {
                  setPassword('');
                  setDeleteError('');
                  setDeleteModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.dangerButtonText}>Delete account and data</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerNote}>
          A Bluetooth wearable cannot see where a child is; it only tells you how near the child is to your phone. Distance is approximate. This app supports, and does not replace, adult supervision.
        </Text>
      </ScrollView>

      {/* Delete Account Modal Dialog */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalScrim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>Delete account and data</Text>
            <Text style={styles.modalBody}>
              This permanently deletes your account, your child profile, pairing and all alerts. It cannot be undone. Enter your password to confirm.
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (deleteError) setDeleteError('');
              }}
            />

            {Boolean(deleteError) && <Text style={styles.errorCoralText}>{deleteError}</Text>}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalDeleteBtn, !password && styles.buttonDisabled]}
                onPress={handleDeleteAccount}
                disabled={!password || isDeleting}
                activeOpacity={0.85}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalDeleteBtnText}>Delete</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 110,
  },
  devMenuCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  devStatesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  devStateBtn: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devStateBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  devStateText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
  devStateTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  cardNoGap: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  smallMuted: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    lineHeight: 18,
  },
  smallMutedCenter: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 4,
  },
  warningText: {
    color: Colors.coral,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  rowBorderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rowTextContainer: {
    flex: 1,
    paddingRight: 12,
    gap: 2,
  },
  rowHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  switchPill: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  notifAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  errorTextMuted: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.coral,
  },
  compactPrimaryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    minHeight: 44,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outlineButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  bodyText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
  },
  accountButtonContainer: {
    gap: 10,
    marginTop: 12,
  },
  dangerButton: {
    backgroundColor: Colors.coralLight,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.coralBorder,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.coral,
  },
  footerNote: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.67)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 312,
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
  },
  modalBody: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
    lineHeight: 20,
  },
  textInput: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textDark,
    backgroundColor: Colors.sand,
  },
  errorCoralText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.coralDark,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalDeleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});

// src/screens/SettingsScreen.tsx
import notifee from '@notifee/react-native';
import { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { clearAlerts, unsyncedCount } from '../data/alertRepo';
import { deleteAuthUser, firebaseReady, logOut, reauthenticate } from '../data/auth';
import { friendlyAuthError } from '../data/authMessages';
import { deleteAccountData, releaseDevice } from '../data/remote';
import { useNav } from '../navigation/types';
import { runtime } from '../runtime';
import { requestNotifications } from '../services/permissions';
import { usePermissions } from '../state/usePermissions';
import { useSession } from '../state/useSession';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

function Row({ title, sub, value, onChange }: { title: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: space.m }}>
        <Text style={type.heading}>{title}</Text>
        <Text style={type.small}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.teal, false: colors.line }} accessibilityLabel={title} />
    </View>
  );
}

export function SettingsScreen() {
  const nav = useNav();
  const s = useSettings((x) => x.settings);
  const user = useSession((x) => x.user);
  const perms = usePermissions();
  const [batteryRestricted, setBatteryRestricted] = useState<boolean | null>(null);
  const [askDelete, setAskDelete] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void notifee.isBatteryOptimizationEnabled().then(setBatteryRestricted).catch(() => setBatteryRestricted(null));
  }, []);

  const wipeLocal = async () => {
    await runtime.stop();
    await clearAlerts();
    await useSettings.getState().reset();
  };

  const logout = async () => {
    const pending = await unsyncedCount();
    const warning =
      pending > 0
        ? `Monitoring will stop on this phone. ${pending} alert(s) have not been uploaded yet and will be lost. Connect to the internet for a minute first to keep them.`
        : 'Monitoring will stop on this phone. Your alerts stay in your account.';
    Alert.alert('Log out?', warning, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await wipeLocal();
            if (user !== null) await logOut();
          })();
        },
      },
    ]);
  };

  const deleteAccount = async () => {
    setBusy(true);
    setError(null);
    try {
      await reauthenticate(password);
      if (s.deviceId !== null) await releaseDevice(s.deviceId).catch(() => undefined);
      await deleteAccountData();
      await deleteAuthUser();
      await wipeLocal();
      setAskDelete(false);
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(false);
      setPassword('');
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={type.heading}>Panic alert</Text>
        <Text style={type.small}>Always on: loud sound and vibration. It cannot be switched off.</Text>
      </Card>

      <Card>
        <Row title="Sound" sub="For range, connection and battery alerts" value={s.soundOn} onChange={(v) => void useSettings.getState().update({ soundOn: v })} />
        <Row title="Vibration" sub="For range, connection and battery alerts" value={s.vibrationOn} onChange={(v) => void useSettings.getState().update({ vibrationOn: v })} />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={type.heading}>Notifications</Text>
            <Text style={type.small}>{perms.report?.notifications === false ? 'Not allowed: alerts cannot reach you' : 'Allowed'}</Text>
          </View>
          {perms.report?.notifications === false ? (
            <Button label="Allow" compact onPress={() => void requestNotifications().then(perms.refresh)} />
          ) : null}
        </View>
      </Card>

      <Button label={`Safe range: ${s.safeRangeM} m`} kind="outline" onPress={() => nav.navigate('SafeRange')} />
      <Gap h={space.s} />
      <Button label="Child profile" kind="outline" onPress={() => nav.navigate('Profile')} />
      <Gap h={space.s} />
      <Button label="Wearable connection" kind="outline" onPress={() => nav.navigate('Connections')} />
      <Gap h={space.s} />
      <Button label="Keep monitoring running" kind="outline" onPress={() => nav.navigate('BackgroundGuide')} />
      <Text style={[type.small, { marginTop: space.xs }]}>
        {batteryRestricted === null ? '' : batteryRestricted ? 'Needs attention: battery optimisation is on for this app' : 'Battery optimisation is off for this app'}
      </Text>

      <Gap h={space.xl} />
      <Text style={type.heading}>Account</Text>
      <Text style={[type.body, { marginVertical: space.s }]}>
        {user !== null ? user.email ?? 'Signed in' : s.localOnly ? 'Using SafeTether without an account: alerts stay on this phone.' : ''}
      </Text>
      {user === null && !firebaseReady() ? <Text style={type.small}>Cloud backup is off because Firebase is not set up in this build.</Text> : null}
      <Button label={user !== null ? 'Log out' : 'Leave and clear this phone'} kind="outline" onPress={() => void logout()} />
      {user !== null ? (
        <>
          <Gap h={space.s} />
          <Button label="Delete account and data" kind="danger" onPress={() => setAskDelete(true)} />
        </>
      ) : null}

      <Gap h={space.xl} />
      <Text style={type.small}>
        A Bluetooth wearable cannot see where a child is; it only tells you how near the child is to your phone. Distance is approximate.
        This app supports, and does not replace, adult supervision.
      </Text>

      <Modal visible={askDelete} transparent animationType="fade" onRequestClose={() => setAskDelete(false)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={type.heading}>Delete account and data?</Text>
            <Gap h={space.s} />
            <Text style={type.body}>
              This permanently deletes your account, your child profile, pairing and all alerts. It cannot be undone. Enter your password
              to confirm.
            </Text>
            <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" accessibilityLabel="Password" />
            {error !== null ? <Text style={{ color: colors.coralDark }}>{error}</Text> : null}
            <Gap />
            <Button label="Delete" kind="danger" busy={busy} disabled={password === ''} onPress={() => void deleteAccount()} />
            <Button label="Cancel" kind="text" disabled={busy} onPress={() => setAskDelete(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space.s },
  backdrop: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: space.xl },
  dialog: { backgroundColor: '#fff', borderRadius: 16, padding: space.xl },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, height: 52, paddingHorizontal: space.l, marginTop: space.m, fontSize: 16 },
});

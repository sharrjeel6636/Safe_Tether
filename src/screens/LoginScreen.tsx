// src/screens/LoginScreen.tsx
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { APP_NAME } from '../core/constants';
import { firebaseReady, register, resetPassword, signIn } from '../data/auth';
import { friendlyAuthError } from '../data/authMessages';
import { registerFcmToken } from '../data/remote';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const configured = firebaseReady();

  const run = async (job: () => Promise<unknown>, done?: string) => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await job();
      if (done !== undefined) setInfo(done);
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const afterLogin = () => void registerFcmToken().catch(() => undefined); // optional second-parent push

  return (
    <Screen contentStyle={{ paddingTop: 72 }}>
      <Text style={styles.logo}>{APP_NAME}</Text>
      <Text style={[type.body, { color: colors.muted }]}>Know that your child is close, and get an alert when they are not.</Text>
      <Gap h={space.xl} />

      {!configured ? (
        <View style={styles.warn}>
          <Text style={type.small}>
            Firebase is not set up in this build (google-services.json is missing), so login and cloud backup are not available yet.
            You can still test the wearable with “Use without an account”.
          </Text>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!busy}
        accessibilityLabel="Email"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
        editable={!busy}
        accessibilityLabel="Password"
      />
      {error !== null ? <Text style={styles.error}>{error}</Text> : null}
      {info !== null ? <Text style={styles.info}>{info}</Text> : null}
      <Gap />
      <Button
        label="Log in"
        busy={busy}
        disabled={!configured || email.trim() === '' || password === ''}
        onPress={() => void run(async () => { await signIn(email, password); afterLogin(); })}
      />
      <Gap h={space.s} />
      <Button
        label="Create account"
        kind="outline"
        disabled={busy || !configured || email.trim() === '' || password === ''}
        onPress={() => void run(async () => { await register(email, password); afterLogin(); })}
      />
      <Button
        label="Forgot password?"
        kind="text"
        disabled={busy || !configured || email.trim() === ''}
        onPress={() => void run(() => resetPassword(email), 'We sent a reset link to that email address.')}
      />
      <Gap h={space.l} />
      <Button label="Use without an account" kind="text" onPress={() => void useSettings.getState().update({ localOnly: true })} />
      <Text style={[type.small, { textAlign: 'center' }]}>
        Without an account nothing is uploaded: alerts stay on this phone.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { fontSize: 34, fontWeight: '800', color: colors.teal, marginBottom: space.s },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: space.l,
    height: 52,
    fontSize: 16,
    marginBottom: space.m,
    color: colors.ink,
  },
  error: { color: colors.coralDark, fontSize: 14 },
  info: { color: colors.ok, fontSize: 14 },
  warn: { backgroundColor: `${colors.warn}24`, borderColor: colors.warn, borderWidth: 1, borderRadius: 12, padding: space.m, marginBottom: space.l },
});

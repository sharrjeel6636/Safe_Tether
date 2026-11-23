// src/screens/ProfileScreen.tsx
// FR14. One child profile per account in this version.
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { currentUser } from '../data/auth';
import { saveProfile } from '../data/remote';
import { useNav } from '../navigation/types';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { Gap, Screen } from '../ui/Screen';
import { colors, space, type } from '../ui/theme';

export function ProfileScreen() {
  const nav = useNav();
  const s = useSettings((x) => x.settings);
  const [name, setName] = useState(s.childName);
  const [age, setAge] = useState(s.childAge);
  const [note, setNote] = useState(s.childNote);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await useSettings.getState().update({ childName: name.trim(), childAge: age.trim(), childNote: note.trim() });
      if (currentUser() !== null && !s.localOnly) {
        // Not awaited: offline, Firestore keeps it queued and uploads it later.
        void saveProfile({ name: name.trim(), age: age.trim(), note: note.trim(), deviceId: s.deviceId }).catch(() => undefined);
      }
      nav.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={type.small}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={40} placeholder="Child's name" accessibilityLabel="Child name" />
      <Text style={type.small}>Age</Text>
      <TextInput style={styles.input} value={age} onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))} maxLength={2} keyboardType="number-pad" placeholder="e.g. 6" accessibilityLabel="Child age" />
      <Text style={type.small}>Note (allergies, a number to call…)</Text>
      <TextInput style={[styles.input, { height: 96, textAlignVertical: 'top', paddingTop: 12 }]} value={note} onChangeText={setNote} maxLength={200} multiline accessibilityLabel="Note" />
      <Gap />
      <Button label="Save" busy={busy} onPress={() => void save()} />
      <Gap />
      <Text style={type.small}>The name is used in alerts, for example “Sara: Out of range”.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: space.l,
    height: 52,
    fontSize: 16,
    marginTop: space.xs,
    marginBottom: space.l,
    color: colors.ink,
  },
});

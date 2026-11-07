import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';
import { initialChildProfile, updateChildProfile } from '../mock/data';

export default function ProfileScreen() {
  const [name, setName] = useState(initialChildProfile.name);
  const [age, setAge] = useState(String(initialChildProfile.age));
  const [note, setNote] = useState(initialChildProfile.note || '');

  const handleAgeChange = (text: string) => {
    // Digits only, max 2 characters
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 2);
    setAge(numeric);
  };

  const handleSave = () => {
    const trimmedName = name.trim() || 'Your child';
    const parsedAge = parseInt(age, 10);
    const validAge = isNaN(parsedAge) ? 7 : parsedAge;
    const trimmedNote = note.trim();

    updateChildProfile({
      name: trimmedName,
      age: validAge,
      note: trimmedNote,
    });

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AppBar kind="stack" title="Child profile" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Name Field Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Child's name"
              placeholderTextColor={Colors.textMuted}
              maxLength={40}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Age Field Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 6"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={2}
              value={age}
              onChangeText={handleAgeChange}
            />
          </View>

          {/* Note Field Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Note (allergies, a number to call…)</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Add important details about your child..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={200}
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
            />
          </View>

          {/* Primary Save Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          The name is used in alerts, for example “{name.trim() || 'Sara'}: Out of range”.
        </Text>
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
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  textInput: {
    width: '100%',
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: Colors.textDark,
  },
  multilineInput: {
    height: 96,
    paddingTop: 12,
    paddingBottom: 12,
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
  footerNote: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 12,
    lineHeight: 18,
  },
});

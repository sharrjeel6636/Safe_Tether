import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { AppBar } from '../components/AppBar';
import { Colors } from '../theme/tokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BrandGuide {
  id: string;
  brand: string;
  steps: string[];
}

const brandGuides: BrandGuide[] = [
  {
    id: 'xiaomi',
    brand: 'Xiaomi, Redmi, POCO',
    steps: [
      'Settings > Apps > Manage apps > SafeTether > Autostart: ON.',
      'Same page > Battery saver: "No restrictions".',
      'Open Recent apps, long-press the SafeTether card, tap the lock icon.',
    ],
  },
  {
    id: 'oppo',
    brand: 'Oppo, Realme, OnePlus',
    steps: [
      'Settings > Apps > SafeTether > Battery usage: "Allow background activity".',
      'Settings > Apps > Auto launch: allow SafeTether.',
      'Lock the app in Recent apps if your phone offers it.',
    ],
  },
  {
    id: 'vivo',
    brand: 'Vivo, iQOO',
    steps: [
      'Settings > Battery > Background power consumption > SafeTether: "Allow".',
      'Settings > Apps > Autostart: allow SafeTether.',
    ],
  },
  {
    id: 'infinix',
    brand: 'Infinix, Tecno, itel',
    steps: [
      'Phone Master or Settings > App management > SafeTether > Autostart: ON.',
      'Battery: set to "No restrictions" or add SafeTether to the protected / locked apps list.',
    ],
  },
  {
    id: 'samsung',
    brand: 'Samsung',
    steps: [
      'Settings > Battery > Background usage limits > Never sleeping apps: add SafeTether.',
      'Settings > Apps > SafeTether > Battery: "Unrestricted".',
    ],
  },
];

export default function BackgroundGuideScreen() {
  const [batteryExempt, setBatteryExempt] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>('xiaomi');

  const handleToggleAccordion = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      // fallback
    }
  };

  const handleAllowMock = () => {
    setBatteryExempt(!batteryExempt);
  };

  return (
    <View style={styles.container}>
      <AppBar kind="stack" title="Keep monitoring running" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Body */}
        <Text style={styles.introBody}>
          If the phone stops SafeTether in the background, alerts will not arrive. Do step 1 on every phone, then the steps for your phone brand.
        </Text>

        {/* Card 1: Allow unrestricted battery use */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>1. Allow unrestricted battery use</Text>
          <Text style={styles.statusBody}>
            {batteryExempt
              ? 'Done: SafeTether is exempt from battery optimisation.'
              : 'Not done yet.'}
          </Text>

          {/* Row of two compact buttons, equal width, gap 12 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleAllowMock}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Allow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={handleOpenSettings}
              activeOpacity={0.85}
            >
              <Text style={styles.outlineBtnText}>App settings</Text>
            </TouchableOpacity>
          </View>

          {/* Text compact Button */}
          <TouchableOpacity
            style={styles.textBtn}
            onPress={handleOpenSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.textBtnText}>Open the phone&apos;s battery manager</Text>
          </TouchableOpacity>
        </View>

        {/* Heading 2 */}
        <Text style={styles.sectionHeading}>2. Steps for your phone brand</Text>
        <Text style={styles.noteText}>
          Menu names change between phone models, so do not claim they are exact.
        </Text>

        {/* Five Accordion Cards */}
        <View style={styles.accordionsContainer}>
          {brandGuides.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={item.id} style={styles.accordionCard}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => handleToggleAccordion(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.accordionBrand}>{item.brand}</Text>
                  <Text style={styles.accordionToggleSign}>{isExpanded ? '−' : '+'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionBody}>
                    {item.steps.map((step, idx) => (
                      <View key={idx} style={styles.bulletRow}>
                        <Text style={styles.bulletSymbol}>•</Text>
                        <Text style={styles.bulletText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Final test paragraph */}
        <Text style={styles.testParagraph}>
          Test it: switch the screen off for an hour, then press the panic button on the wearable. The alert must arrive.
        </Text>
      </ScrollView>
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
    gap: 16,
    paddingBottom: 96,
  },
  introBody: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textDark,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  statusBody: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outlineBtn: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  textBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 4,
  },
  textBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 4,
  },
  noteText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: -8,
  },
  accordionsContainer: {
    gap: 10,
  },
  accordionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
  },
  accordionToggleSign: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  accordionBody: {
    padding: 16,
    paddingTop: 0,
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
    lineHeight: 20,
  },
  testParagraph: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    lineHeight: 20,
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    marginTop: 4,
  },
});

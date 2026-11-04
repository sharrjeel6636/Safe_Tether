import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../theme/tokens';

interface AppBarProps {
  kind?: 'tab' | 'stack' | 'panic';
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function AppBar({ kind = 'stack', title, subtitle, onBack, rightAction }: AppBarProps) {
  const isPanic = kind === 'panic';
  const isTab = kind === 'tab';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View
      style={[
        styles.container,
        isPanic ? styles.panicContainer : styles.normalContainer,
        isTab && styles.tabContainerPadding,
      ]}
    >
      {!isTab && (
        <TouchableOpacity
          style={[styles.backButton, isPanic ? styles.panicBackButton : styles.normalBackButton]}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={isPanic ? '#FFFFFF' : Colors.textDark}
          />
        </TouchableOpacity>
      )}

      <View style={[styles.titleContainer, isTab && { marginLeft: 4 }]}>
        <Text
          style={[
            styles.titleText,
            isPanic ? styles.panicTitleText : styles.normalTitleText,
            isTab && styles.tabTitleText,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitleText,
              isPanic ? styles.panicSubtitleText : styles.normalSubtitleText,
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightAction && <View style={styles.rightActionContainer}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  normalContainer: {
    backgroundColor: Colors.sand,
    borderBottomColor: Colors.border,
  },
  panicContainer: {
    backgroundColor: Colors.panicRed,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainerPadding: {
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  normalBackButton: {
    backgroundColor: Colors.cardBg,
    borderColor: Colors.border,
  },
  panicBackButton: {
    backgroundColor: Colors.panicRedLight,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontWeight: '800',
  },
  normalTitleText: {
    fontSize: 20,
    color: Colors.textDark,
  },
  panicTitleText: {
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tabTitleText: {
    fontSize: 24,
    color: Colors.textDark,
  },
  subtitleText: {
    fontSize: 13,
    marginTop: 2,
  },
  normalSubtitleText: {
    color: Colors.textMuted,
  },
  panicSubtitleText: {
    color: '#FEE2E2',
  },
  rightActionContainer: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

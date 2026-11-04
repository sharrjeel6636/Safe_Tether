import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/tokens';

export function CustomTabBar({ state, descriptors }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          if (!isFocused) {
            if (route.name === 'index') {
              router.replace('/(tabs)');
            } else if (route.name === 'alerts') {
              router.replace('/(tabs)/alerts');
            } else if (route.name === 'settings') {
              router.replace('/(tabs)/settings');
            } else {
              router.replace(`/(tabs)/${route.name}` as any);
            }
          }
        };

        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        if (route.name === 'index') {
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'alerts') {
          iconName = isFocused ? 'notifications' : 'notifications-outline';
        } else if (route.name === 'settings') {
          iconName = isFocused ? 'settings' : 'settings-outline';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <Ionicons
              name={iconName}
              size={22}
              color={isFocused ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

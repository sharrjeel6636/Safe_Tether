// src/navigation/types.ts
import { createNavigationContainerRef, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  Radar: undefined;
  OutOfRange: undefined;
  Panic: undefined;
  LowBattery: undefined;
  Buzzer: undefined;
  LastLocation: { alertId?: number } | undefined;
  Connections: undefined;
  Profile: undefined;
  SafeRange: undefined;
  BackgroundGuide: undefined;
};

export type TabParamList = { Home: undefined; History: undefined; Settings: undefined };

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const useNav = () => useNavigation<NativeStackNavigationProp<RootStackParamList>>();

/**
 * Opens the screen a notification asked for. The navigator may not be ready yet (the app was just
 * started by the tap) or may still show the login, so it retries for a few seconds.
 */
export function openRoute(route: unknown, attempt = 0): void {
  const names: (keyof RootStackParamList)[] = ['Panic', 'OutOfRange', 'LowBattery'];
  const target = names.find((n) => n === route);
  if (target === undefined || attempt > 20) return;
  // Before the first screen is shown the root state can be undefined.
  const available = navigationRef.isReady() ? (navigationRef.getRootState()?.routeNames ?? []) : [];
  if (available.includes(target)) navigationRef.navigate(target);
  else setTimeout(() => openRoute(route, attempt + 1), 300);
}

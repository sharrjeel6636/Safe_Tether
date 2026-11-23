// src/services/permissions.ts
// Runtime permissions, asked one group at a time (the screens explain why before each request).
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import * as Location from 'expo-location';
import { PermissionsAndroid, Platform } from 'react-native';
import type { Permission } from 'react-native';
import { canMonitor } from './permissionReport';
import type { PermissionReport } from './permissionReport';

export { canMonitor };
export type { PermissionReport };

const api = (): number => (typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10));

const bluetoothPermissions = (): Permission[] =>
  api() >= 31
    ? [PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]
    : [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

export async function checkPermissions(): Promise<PermissionReport> {
  if (Platform.OS !== 'android') return { bluetooth: true, location: true, notifications: true };
  const bt = await Promise.all(bluetoothPermissions().map((p) => PermissionsAndroid.check(p)));
  const loc = await Location.getForegroundPermissionsAsync();
  const notif = await notifee.getNotificationSettings();
  return {
    bluetooth: bt.every(Boolean),
    location: loc.granted,
    notifications: notif.authorizationStatus === AuthorizationStatus.AUTHORIZED,
  };
}

export async function requestBluetooth(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const result = await PermissionsAndroid.requestMultiple(bluetoothPermissions());
  return Object.values(result).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
}

export async function requestLocation(): Promise<boolean> {
  return (await Location.requestForegroundPermissionsAsync()).granted;
}

export async function requestNotifications(): Promise<boolean> {
  const s = await notifee.requestPermission();
  return s.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

/** Asks for everything the monitor needs, in the order the user needs to understand it. */
export async function requestAll(): Promise<PermissionReport> {
  const bluetooth = await requestBluetooth();
  const notifications = await requestNotifications();
  const location = await requestLocation(); // optional: the monitor still works without it
  return { bluetooth, location, notifications };
}

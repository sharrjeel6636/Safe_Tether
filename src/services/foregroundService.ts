// src/services/foregroundService.ts
// Keeps the process (and so the Bluetooth link and the timers) alive while the screen is off.
// Notifee's foreground service is just a notification plus a JS task that never finishes.
import notifee, { AndroidForegroundServiceType, AndroidImportance } from '@notifee/react-native';
import { FOREGROUND_NOTIFICATION_ID } from '../core/constants';
import type { MonitorSnapshot } from '../domain/types';
import { ensureChannels, MONITOR_CHANNEL, monitorText, monitorTitle } from './notifier';

let release: (() => void) | null = null;

/** Call once at app start, in index.ts, before the app is registered. */
export function registerForegroundServiceRunner(): void {
  notifee.registerForegroundService(
    () =>
      new Promise<void>((resolve) => {
        release = resolve; // stopForeground() resolves it
      }),
  );
}

/**
 * Starts the service, or refreshes its notification text when it is already running.
 * Service types must also be declared in the manifest (plugins/withMonitorService.js), and
 * Android 14+ refuses the `location` type unless location permission was granted first.
 */
export async function showForeground(s: MonitorSnapshot, childName: string, withLocation: boolean): Promise<void> {
  await ensureChannels();
  const types = [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE];
  if (withLocation) types.push(AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_LOCATION);
  await notifee.displayNotification({
    id: FOREGROUND_NOTIFICATION_ID,
    title: monitorTitle(childName),
    body: monitorText(s),
    android: {
      channelId: MONITOR_CHANNEL,
      asForegroundService: true,
      foregroundServiceTypes: types,
      ongoing: true,
      importance: AndroidImportance.LOW,
      smallIcon: 'ic_launcher',
      onlyAlertOnce: true,
      pressAction: { id: 'default' },
    },
  });
}

export async function stopForeground(): Promise<void> {
  release?.();
  release = null;
  await notifee.stopForegroundService().catch(() => undefined);
  await notifee.cancelNotification(FOREGROUND_NOTIFICATION_ID).catch(() => undefined);
}

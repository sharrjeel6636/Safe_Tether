// src/services/notifier.ts
// Alert notifications and the persistent "monitoring" notification, on top of Notifee.
import notifee, { AndroidCategory, AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { APP_NAME, Defaults, FOREGROUND_NOTIFICATION_ID } from '../core/constants';
import { formatMetres } from '../core/format';
import { ALERT_TITLE, LINK_LABEL, ZONE_LABEL } from '../domain/types';
import type { AlertEvent, MonitorSnapshot } from '../domain/types';

export const MONITOR_CHANNEL = 'monitor';

/** Which screen a notification opens (read in App.tsx when the user taps it). */
export type AlertRoute = 'Panic' | 'OutOfRange' | 'LowBattery' | 'Home';

export interface NotifyOptions {
  childName: string;
  sound: boolean;
  vibration: boolean;
  safeRangeM: number;
  batteryPct: number | null;
}

/**
 * Android fixes the sound and vibration of a channel when it is created, so there is one
 * channel per combination and the Settings switches pick the right one.
 */
export const alertChannelId = (sound: boolean, vibration: boolean): string =>
  `alerts_${sound ? 's' : 'q'}${vibration ? 'v' : 'n'}`;

export async function ensureChannels(): Promise<void> {
  await notifee.createChannel({
    id: MONITOR_CHANNEL,
    name: 'Monitoring status',
    description: 'The quiet notification that shows SafeTether is watching.',
    importance: AndroidImportance.LOW,
    vibration: false,
  });
  for (const sound of [true, false]) {
    for (const vibration of [true, false]) {
      await notifee.createChannel({
        id: alertChannelId(sound, vibration),
        name: `Alerts (${sound ? 'sound' : 'silent'}${vibration ? ', vibration' : ''})`,
        importance: sound ? AndroidImportance.HIGH : AndroidImportance.DEFAULT,
        sound: sound ? 'default' : undefined,
        vibration,
        vibrationPattern: vibration ? [300, 500, 300, 500] : undefined,
        bypassDnd: false,
        visibility: AndroidVisibility.PUBLIC,
      });
    }
  }
}

export function routeFor(type: AlertEvent['type']): AlertRoute {
  switch (type) {
    case 'panic':
      return 'Panic';
    case 'out_of_range':
      return 'OutOfRange';
    case 'low_battery':
      return 'LowBattery';
    default:
      return 'Home';
  }
}

export function alertBody(e: AlertEvent, o: NotifyOptions): string {
  switch (e.type) {
    case 'panic':
      return 'The panic button was held. Open the app to see where the child is.';
    case 'out_of_range':
      return `About ${formatMetres(e.distanceM ?? o.safeRangeM)} away, beyond the ${formatMetres(o.safeRangeM)} safe range.`;
    case 'connection_lost':
      return 'No Bluetooth signal from the wearable for 30 seconds.';
    case 'low_battery':
      return `The wearable battery is ${o.batteryPct ?? Defaults.lowBatteryPct} % or lower. Charge it soon.`;
    case 'buzzer':
      return 'The buzzer was started from this phone.';
  }
}

/** Shows one alert. The buzzer is the parent's own action, so it does not notify. */
export async function showAlert(e: AlertEvent, o: NotifyOptions): Promise<void> {
  if (e.type === 'buzzer') return;
  await notifee.displayNotification({
    id: `alert_${e.type}`, // a repeat of the same alert replaces the old one
    title: `${o.childName || 'Your child'}: ${ALERT_TITLE[e.type]}`,
    body: alertBody(e, o),
    data: { route: routeFor(e.type) },
    android: {
      channelId: alertChannelId(o.sound, o.vibration),
      category: e.type === 'panic' ? AndroidCategory.ALARM : AndroidCategory.STATUS,
      importance: AndroidImportance.HIGH,
      smallIcon: 'ic_launcher',
      timestamp: e.at,
      showTimestamp: true,
      pressAction: { id: 'default' },
      autoCancel: true,
    },
  });
}

/** Text of the permanent notification, for example "Connected · Near · battery 82 %". No distance: it would change every second. */
export function monitorText(s: MonitorSnapshot): string {
  if (!s.bluetoothOn) return 'Bluetooth is off: turn it on to keep watching';
  const parts: string[] = [LINK_LABEL[s.link]];
  if (s.link === 'connected' || s.link === 'outOfRange') parts.push(ZONE_LABEL[s.zone]);
  if (s.batteryPct !== null) parts.push(`battery ${s.batteryPct} %`);
  return parts.join(' · ');
}

export const monitorTitle = (childName: string): string =>
  childName ? `${APP_NAME} is watching ${childName}` : `${APP_NAME} is watching`;

export { FOREGROUND_NOTIFICATION_ID };

// src/domain/types.ts
import { Defaults } from '../core/constants';

// ---- alerts -------------------------------------------------------------------------------

/** The string is what is stored in SQLite and Firestore (it must match the Firestore rules). */
export type AlertType = 'panic' | 'out_of_range' | 'connection_lost' | 'low_battery' | 'buzzer';

export const ALERT_TYPES: readonly AlertType[] = [
  'panic',
  'out_of_range',
  'connection_lost',
  'low_battery',
  'buzzer',
];

export const ALERT_TITLE: Record<AlertType, string> = {
  panic: 'Panic button pressed',
  out_of_range: 'Out of range',
  connection_lost: 'Connection lost',
  low_battery: 'Low battery',
  buzzer: 'Buzzer used',
};

export function isAlertType(s: string): s is AlertType {
  return (ALERT_TYPES as readonly string[]).includes(s);
}

/** History filter chips (FR10). */
export type AlertFilter = 'all' | 'panic' | 'range' | 'battery' | 'connection';
export const ALERT_FILTERS: readonly AlertFilter[] = ['all', 'panic', 'range', 'battery', 'connection'];
export const FILTER_LABEL: Record<AlertFilter, string> = {
  all: 'All',
  panic: 'Panic',
  range: 'Range',
  battery: 'Battery',
  connection: 'Connection',
};
/** Alert types included by a filter; an empty list means "everything". */
export const FILTER_TYPES: Record<AlertFilter, readonly AlertType[]> = {
  all: [],
  panic: ['panic'],
  range: ['out_of_range'],
  battery: ['low_battery'],
  connection: ['connection_lost'],
};

export interface AlertEvent {
  type: AlertType;
  at: number; // epoch milliseconds
  distanceM?: number;
}

/** One stored alert (a row of the SQLite table). */
export interface AlertRow {
  id: number;
  type: AlertType;
  at: number;
  distanceM: number | null;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  synced: boolean;
  remoteId: string | null;
}

// ---- link and zone ------------------------------------------------------------------------

export type LinkState =
  | 'searching'
  | 'connected'
  | 'outOfRange'
  | 'disconnected'
  | 'reconnecting'
  | 'connectionLost';

export type Zone = 'near' | 'medium' | 'far';

export const LINK_LABEL: Record<LinkState, string> = {
  searching: 'Searching',
  connected: 'Connected',
  outOfRange: 'Out of range',
  disconnected: 'Disconnected',
  reconnecting: 'Reconnecting',
  connectionLost: 'Connection lost',
};

export const ZONE_LABEL: Record<Zone, string> = { near: 'Near', medium: 'Medium', far: 'Far' };

/** true while the wearable can be reached over Bluetooth. */
export const isLinked = (s: LinkState): boolean => s === 'connected' || s === 'outOfRange';

// ---- what the monitor needs ---------------------------------------------------------------

/** Everything the monitor reads from Settings. */
export interface MonitorConfig {
  deviceId: string | null;
  childName: string;
  safeRangeM: number;
  rssiAt1m: number;
  pathLossN: number;
  soundOn: boolean;
  vibrationOn: boolean;
}

export const DEFAULT_CONFIG: MonitorConfig = {
  deviceId: null,
  childName: '',
  safeRangeM: Defaults.safeRangeM,
  rssiAt1m: Defaults.rssiAt1m,
  pathLossN: Defaults.pathLossN,
  soundOn: true,
  vibrationOn: true,
};

/** What the screens need to know right now. */
export interface MonitorSnapshot {
  monitoring: boolean; // a wearable is saved and the monitor is running
  link: LinkState;
  distanceM: number | null; // smoothed, approximate
  rssiDbm: number | null; // smoothed signal strength, used by "Calibrate at 1 m"
  zone: Zone;
  batteryPct: number | null;
  charging: boolean;
  lastSeen: number | null; // last time any data arrived from the wearable
  buzzSecondsLeft: number;
  bluetoothOn: boolean;
  safeRangeM: number;
}

export const INITIAL_SNAPSHOT: MonitorSnapshot = {
  monitoring: false,
  link: 'searching',
  distanceM: null,
  rssiDbm: null,
  zone: 'near',
  batteryPct: null,
  charging: false,
  lastSeen: null,
  buzzSecondsLeft: 0,
  bluetoothOn: true,
  safeRangeM: Defaults.safeRangeM,
};

export const isBuzzing = (s: MonitorSnapshot): boolean => s.buzzSecondsLeft > 0;
export const isLowBattery = (s: MonitorSnapshot): boolean =>
  s.batteryPct != null && s.batteryPct <= Defaults.lowBatteryPct && !s.charging;

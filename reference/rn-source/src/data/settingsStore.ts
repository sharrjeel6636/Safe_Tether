// src/data/settingsStore.ts
// Settings that survive a restart (AsyncStorage). The monitor reads the MonitorConfig part.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CONFIG } from '../domain/types';
import type { MonitorConfig } from '../domain/types';

export interface AppSettings extends MonitorConfig {
  childAge: string;
  childNote: string;
  /** The parent chose "Use without an account": nothing is uploaded. */
  localOnly: boolean;
  /** The "Keep SafeTether running" guide was shown once. */
  guideSeen: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  ...DEFAULT_CONFIG,
  childAge: '',
  childNote: '',
  localOnly: false,
  guideSeen: false,
};

const KEY = 'safetether.settings.v1';

const str = (v: unknown, fallback: string): string => (typeof v === 'string' ? v : fallback);
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);
const num = (v: unknown, fallback: number, min: number, max: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** Accepts anything that was stored (older versions, hand-edited, damaged) and returns valid settings. */
export function mergeSettings(raw: unknown): AppSettings {
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    deviceId: typeof o.deviceId === 'string' && o.deviceId.length > 0 ? o.deviceId : null,
    childName: str(o.childName, d.childName).slice(0, 40),
    safeRangeM: num(o.safeRangeM, d.safeRangeM, 2, 50),
    rssiAt1m: num(o.rssiAt1m, d.rssiAt1m, -90, -30),
    pathLossN: num(o.pathLossN, d.pathLossN, 1.5, 4),
    soundOn: bool(o.soundOn, d.soundOn),
    vibrationOn: bool(o.vibrationOn, d.vibrationOn),
    childAge: str(o.childAge, d.childAge).slice(0, 3),
    childNote: str(o.childNote, d.childNote).slice(0, 200),
    localOnly: bool(o.localOnly, d.localOnly),
    guideSeen: bool(o.guideSeen, d.guideSeen),
  };
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const text = await AsyncStorage.getItem(KEY);
    return mergeSettings(text === null ? null : JSON.parse(text));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(s));
}

export async function clearSettings(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/** The part of the settings the monitor needs. */
export const toMonitorConfig = (s: AppSettings): MonitorConfig => ({
  deviceId: s.deviceId,
  childName: s.childName,
  safeRangeM: s.safeRangeM,
  rssiAt1m: s.rssiAt1m,
  pathLossN: s.pathLossN,
  soundOn: s.soundOn,
  vibrationOn: s.vibrationOn,
});

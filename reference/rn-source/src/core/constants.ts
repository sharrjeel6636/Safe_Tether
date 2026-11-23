// src/core/constants.ts

/** UUIDs of the wearable's GATT service (generated for this project, same as the firmware). */
export const Uuids = {
  service: 'a7c30001-8e6f-42ea-8292-1758b7090812',
  panic: 'a7c30002-8e6f-42ea-8292-1758b7090812',
  buzzer: 'a7c30003-8e6f-42ea-8292-1758b7090812',
  status: 'a7c30004-8e6f-42ea-8292-1758b7090812',
  batteryService: '0000180f-0000-1000-8000-00805f9b34fb',
  batteryLevel: '00002a19-0000-1000-8000-00805f9b34fb',
} as const;

export const APP_NAME = 'SafeTether';

/** Starting values: tune them with the RSSI experiment (Step 4) and the field trials (Step 11). */
export const Defaults = {
  rssiAt1m: -59, // A
  pathLossN: 2.5, // n
  safeRangeM: 10, // "Medium" preset
  outForSeconds: 4,
  rearmFraction: 0.8,
  lostAfterSeconds: 30,
  lowBatteryPct: 20,
  lowBatteryRearmPct: 25,
  buzzSeconds: 30,
  rangePresets: { Short: 5, Medium: 10, Long: 20 } as Record<string, number>,
  /** Zone edges as fractions of the safe range: Near < 40 %, Medium up to 100 %, Far beyond it. */
  zoneNearFraction: 0.4,
  /** Moving back to a nearer zone needs a 10 % margin, so the zone does not flicker. */
  zoneHysteresis: 0.1,
} as const;

export const FOREGROUND_NOTIFICATION_ID = 'monitor';
export const PANIC_HOLD_MS = 1500;

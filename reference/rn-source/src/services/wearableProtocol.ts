// src/services/wearableProtocol.ts
// The payloads of the BLE contract (Section 4.8). Pure functions, unit-tested.

/** Decoded Status characteristic: [flags, fwMajor, fwMinor]. Flag bit 0 = charging, bit 1 = low battery. */
export interface WearableStatus {
  charging: boolean;
  lowBattery: boolean;
  fwMajor: number;
  fwMinor: number;
}

export function parseStatus(v: readonly number[]): WearableStatus {
  const flags = v[0] ?? 0;
  return {
    charging: v.length > 0 && (flags & 0x01) !== 0,
    lowBattery: v.length > 0 && (flags & 0x02) !== 0,
    fwMajor: v[1] ?? 0,
    fwMinor: v[2] ?? 0,
  };
}

/** Panic characteristic: [state, counter]. Returns the counter of a press, or null for anything else. */
export function parsePanic(v: readonly number[]): number | null {
  return v.length >= 2 && v[0] === 1 ? (v[1] as number) : null;
}

/** Battery Level characteristic: one byte, 0 to 100. */
export function parseBattery(v: readonly number[]): number | null {
  const p = v[0];
  return p === undefined ? null : Math.min(100, Math.max(0, p));
}

/** Buzzer characteristic: [1, seconds] to start (the wearable stops by itself), [0] to stop. */
export function buzzPayload(on: boolean, seconds: number): number[] {
  return on ? [1, Math.min(120, Math.max(1, Math.round(seconds)))] : [0];
}

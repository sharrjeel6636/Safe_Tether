// src/services/bleTypes.ts
import type { WearableStatus } from './wearableProtocol';
import type { Unsubscribe } from './emitter';

/** A wearable found while scanning (Connections screen). */
export interface FoundDevice {
  id: string; // the Android MAC address: stable for one phone and one wearable
  name: string;
  rssi: number | null;
}

/**
 * Everything the monitor needs from Bluetooth. The real implementation (bleService.ts) uses
 * react-native-ble-plx; the tests use a fake, so the whole alert logic runs without a phone.
 */
export interface BleLink {
  /** Start (or switch to) a wearable: connect, subscribe, and keep reconnecting until stop(). */
  start(deviceId: string): void;
  stop(): Promise<void>;

  /** true = connected and subscribed, false = link dropped. */
  onLink(listener: (up: boolean) => void): Unsubscribe;
  /** Raw RSSI in dBm, about once a second while connected. */
  onRssi(listener: (dbm: number) => void): Unsubscribe;
  /** A press of the panic button, with the firmware's counter. */
  onPanic(listener: (counter: number) => void): Unsubscribe;
  /** Battery percent (0 to 100). */
  onBattery(listener: (percent: number) => void): Unsubscribe;
  onStatus(listener: (status: WearableStatus) => void): Unsubscribe;
  /** The phone's Bluetooth switch. */
  onBluetoothState(listener: (on: boolean) => void): Unsubscribe;
  /** The link is up and the retry loop is running again after a drop (drives "Reconnecting"). */
  onReconnecting(listener: () => void): Unsubscribe;

  /** Start the buzzer for `seconds` (the wearable stops itself) or stop it. */
  buzz(on: boolean, seconds: number): Promise<void>;
}

// src/services/bleService.ts
// The real Bluetooth link, built on react-native-ble-plx (MIT licence).
// One loop keeps the wearable connected: connect, subscribe, poll RSSI, wait for a drop, back off, repeat.
import { BleManager, ScanMode, State } from 'react-native-ble-plx';
import type { BleError, Characteristic, Subscription } from 'react-native-ble-plx';
import { Uuids } from '../core/constants';
import { base64ToBytes, bytesToBase64 } from './base64';
import type { BleLink, FoundDevice } from './bleTypes';
import { Emitter } from './emitter';
import type { Unsubscribe } from './emitter';
import { buzzPayload, parseBattery, parsePanic, parseStatus } from './wearableProtocol';
import type { WearableStatus } from './wearableProtocol';

const MIN_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
const CONNECT_TIMEOUT_MS = 30_000;
const RSSI_INTERVAL_MS = 1_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class BlePlxLink implements BleLink {
  // Created on first use: importing this file must not touch native code (tests, headless start).
  private manager: BleManager | null = null;
  private stateSub: Subscription | null = null;
  private deviceId: string | null = null;
  /** Changes on every start() and stop(), so an old loop notices and ends itself. */
  private runId = 0;
  private bluetoothOn = true;

  private readonly linkE = new Emitter<boolean>();
  private readonly rssiE = new Emitter<number>();
  private readonly panicE = new Emitter<number>();
  private readonly batteryE = new Emitter<number>();
  private readonly statusE = new Emitter<WearableStatus>();
  private readonly btE = new Emitter<boolean>();
  private readonly reconnectingE = new Emitter<void>();

  onLink = (l: (up: boolean) => void): Unsubscribe => this.linkE.on(l);
  onRssi = (l: (dbm: number) => void): Unsubscribe => this.rssiE.on(l);
  onPanic = (l: (counter: number) => void): Unsubscribe => this.panicE.on(l);
  onBattery = (l: (percent: number) => void): Unsubscribe => this.batteryE.on(l);
  onStatus = (l: (s: WearableStatus) => void): Unsubscribe => this.statusE.on(l);
  onBluetoothState = (l: (on: boolean) => void): Unsubscribe => this.btE.on(l);
  onReconnecting = (l: () => void): Unsubscribe => this.reconnectingE.on(l);

  private mgr(): BleManager {
    if (this.manager === null) {
      this.manager = new BleManager();
      this.stateSub = this.manager.onStateChange((s) => {
        this.bluetoothOn = s === State.PoweredOn;
        this.btE.emit(this.bluetoothOn);
      }, true);
    }
    return this.manager;
  }

  start(deviceId: string): void {
    this.mgr();
    this.deviceId = deviceId;
    const run = ++this.runId;
    void this.loop(deviceId, run);
  }

  async stop(): Promise<void> {
    this.runId++; // ends the loop
    const id = this.deviceId;
    this.deviceId = null;
    if (this.manager !== null && id !== null) {
      await this.manager.cancelDeviceConnection(id).catch(() => undefined);
    }
  }

  /** Releases the native manager (used when the app shuts the monitor down for good). */
  async dispose(): Promise<void> {
    await this.stop();
    this.stateSub?.remove();
    this.stateSub = null;
    await this.manager?.destroy().catch(() => undefined);
    this.manager = null;
  }

  /** Android only: asks the system to switch Bluetooth on (shows the system dialog). */
  async enableBluetooth(): Promise<void> {
    await this.mgr().enable().catch(() => undefined);
  }

  // ---- scanning (Connections screen) ---------------------------------------------------------

  async scan(onFound: (d: FoundDevice) => void, durationMs = 10_000): Promise<void> {
    const m = this.mgr();
    await m.startDeviceScan([Uuids.service], { scanMode: ScanMode.LowLatency }, (error, device) => {
      if (error !== null || device === null) return;
      onFound({ id: device.id, name: device.localName ?? device.name ?? 'SafeTether', rssi: device.rssi });
    });
    await sleep(durationMs);
    await m.stopDeviceScan().catch(() => undefined);
  }

  async stopScan(): Promise<void> {
    await this.manager?.stopDeviceScan().catch(() => undefined);
  }

  // ---- commands ------------------------------------------------------------------------------

  async buzz(on: boolean, seconds: number): Promise<void> {
    const id = this.deviceId;
    if (id === null) throw new Error('No wearable is connected');
    await this.mgr().writeCharacteristicWithResponseForDevice(
      id,
      Uuids.service,
      Uuids.buzzer,
      bytesToBase64(buzzPayload(on, seconds)),
    );
  }

  // ---- the connection loop -------------------------------------------------------------------

  private async loop(id: string, run: number): Promise<void> {
    let backoff = MIN_BACKOFF_MS;
    while (this.runId === run) {
      if (!this.bluetoothOn) {
        await sleep(1_000);
        continue;
      }
      try {
        const wasUp = await this.session(id, run);
        backoff = wasUp ? MIN_BACKOFF_MS : Math.min(backoff * 2, MAX_BACKOFF_MS);
      } catch (e) {
        console.warn('[ble] session failed', e);
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      }
      if (this.runId !== run) return;
      this.reconnectingE.emit();
      await sleep(backoff);
    }
  }

  /** Runs one connection from connect to disconnect. Resolves true when the link was fully up. */
  private async session(id: string, run: number): Promise<boolean> {
    const m = this.mgr();
    const subs: Subscription[] = [];
    let timer: ReturnType<typeof setInterval> | null = null;
    let up = false;
    try {
      const device = await m.connectToDevice(id, { autoConnect: true, timeout: CONNECT_TIMEOUT_MS });
      if (this.runId !== run) return false;

      // Register for the drop before anything else, so a drop during setup is not missed.
      const gone = new Promise<void>((resolve) => {
        subs.push(m.onDeviceDisconnected(id, () => resolve()));
      });

      await device.discoverAllServicesAndCharacteristics();
      if (this.runId !== run) return false;

      const listen = (characteristic: string, handle: (bytes: number[]) => void) => {
        subs.push(
          m.monitorCharacteristicForDevice(
            id,
            Uuids.service,
            characteristic,
            (error: BleError | null, c: Characteristic | null) => {
              if (error !== null || c === null) return; // a drop also lands here; `gone` handles it
              handle(base64ToBytes(c.value));
            },
          ),
        );
      };
      listen(Uuids.panic, (bytes) => {
        const counter = parsePanic(bytes);
        if (counter !== null) this.panicE.emit(counter);
      });
      listen(Uuids.status, (bytes) => this.statusE.emit(parseStatus(bytes)));
      subs.push(
        m.monitorCharacteristicForDevice(id, Uuids.batteryService, Uuids.batteryLevel, (error, c) => {
          if (error !== null || c === null) return;
          const p = parseBattery(base64ToBytes(c.value));
          if (p !== null) this.batteryE.emit(p);
        }),
      );

      up = true;
      this.linkE.emit(true);

      // Notifications only fire on change, so read the current values once.
      void this.readOnce(id, Uuids.batteryService, Uuids.batteryLevel, (b) => {
        const p = parseBattery(b);
        if (p !== null) this.batteryE.emit(p);
      });
      void this.readOnce(id, Uuids.service, Uuids.status, (b) => this.statusE.emit(parseStatus(b)));
      void this.ensureBonded(id);

      let reading = false;
      timer = setInterval(() => {
        if (reading) return;
        reading = true;
        m.readRSSIForDevice(id)
          .then((d) => {
            if (d.rssi !== null) this.rssiE.emit(d.rssi);
          })
          .catch(() => undefined)
          .finally(() => {
            reading = false;
          });
      }, RSSI_INTERVAL_MS);

      await gone;
      return true;
    } finally {
      if (timer !== null) clearInterval(timer);
      for (const s of subs) s.remove();
      if (up) this.linkE.emit(false);
    }
  }

  private async readOnce(id: string, service: string, characteristic: string, handle: (b: number[]) => void) {
    try {
      const c = await this.mgr().readCharacteristicForDevice(id, service, characteristic);
      handle(base64ToBytes(c.value));
    } catch (e) {
      console.warn('[ble] read failed', characteristic, e);
    }
  }

  /**
   * react-native-ble-plx has no createBond(). The buzzer characteristic needs an encrypted link,
   * so writing "stop" to it makes Android start pairing (Just Works) the first time and do nothing
   * harmful afterwards. Needs to be confirmed on a real phone (Appendix F, test T16).
   */
  private async ensureBonded(id: string): Promise<void> {
    try {
      await this.mgr().writeCharacteristicWithResponseForDevice(
        id,
        Uuids.service,
        Uuids.buzzer,
        bytesToBase64(buzzPayload(false, 0)),
      );
    } catch (e) {
      console.warn('[ble] bonding write failed', e);
    }
  }
}

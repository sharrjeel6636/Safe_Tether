// src/services/monitorRuntime.ts
// Ties the pieces together: Bluetooth link -> MonitorController -> notification, phone database,
// position fix, cloud sync and the foreground service. Every outside dependency is injected, so the
// wiring is unit-tested with fakes (runtime.ts supplies the real ones).
import type { AlertEvent, MonitorSnapshot } from '../domain/types';
import { toMonitorConfig } from '../data/settingsStore';
import type { AppSettings } from '../data/settingsStore';
import type { BleLink } from './bleTypes';
import type { Fix } from './location';
import { MonitorController } from './monitorController';
import type { NotifyOptions } from './notifier';
import { canMonitor } from './permissionReport';
import type { PermissionReport } from './permissionReport';

export interface RuntimeDeps {
  link: BleLink;
  checkPermissions(): Promise<PermissionReport>;
  showForeground(s: MonitorSnapshot, childName: string, withLocation: boolean): Promise<void>;
  stopForeground(): Promise<void>;
  showAlert(e: AlertEvent, o: NotifyOptions): Promise<void>;
  currentFix(): Promise<Fix | null>;
  insertAlert(e: AlertEvent, fix: Fix | null): Promise<number>;
  setAlertLocation(id: number, fix: Fix): Promise<void>;
  sync(deviceId: string | null, localOnly: boolean): Promise<void>;
  /** Pushes every snapshot to the screens. */
  onSnapshot(s: MonitorSnapshot): void;
  /** The alert list on screen should be reloaded. */
  onAlertsChanged(): void;
  /** false when the foreground service could not start (the UI then warns the parent). */
  onForegroundState(running: boolean): void;
  clock?: () => number;
}

export type StartResult = 'started' | 'already-running' | 'no-device' | 'no-permission';

const SYNC_EVERY_MS = 5 * 60_000;

export class MonitorRuntime {
  private controller: MonitorController | null = null;
  private settings!: AppSettings;
  private lastForegroundText = '';
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private withLocation = false;

  constructor(private readonly d: RuntimeDeps) {}

  get running(): boolean {
    return this.controller?.isRunning ?? false;
  }

  get link(): BleLink {
    return this.d.link;
  }

  async start(settings: AppSettings): Promise<StartResult> {
    if (this.running) {
      this.applySettings(settings);
      return 'already-running';
    }
    this.settings = settings;
    if (settings.deviceId === null) return 'no-device';
    const perms = await this.d.checkPermissions();
    if (!canMonitor(perms)) return 'no-permission';
    this.withLocation = perms.location;

    const controller = new MonitorController(
      this.d.link,
      toMonitorConfig(settings),
      {
        onSnapshot: (s) => this.handleSnapshot(s),
        onAlert: (e) => void this.handleAlert(e),
      },
      this.d.clock,
    );
    this.controller = controller;
    this.lastForegroundText = '';

    try {
      await this.d.showForeground(controller.snapshot, settings.childName, this.withLocation);
      this.d.onForegroundState(true);
    } catch (e) {
      // Without the service the monitor still works while the app is open.
      console.warn('[runtime] foreground service did not start', e);
      this.d.onForegroundState(false);
    }

    controller.start();
    this.syncTimer = setInterval(() => void this.d.sync(this.settings.deviceId, this.settings.localOnly), SYNC_EVERY_MS);
    void this.d.sync(settings.deviceId, settings.localOnly);
    return 'started';
  }

  async stop(): Promise<void> {
    if (this.syncTimer !== null) clearInterval(this.syncTimer);
    this.syncTimer = null;
    await this.controller?.stop();
    this.controller = null;
    await this.d.stopForeground();
    this.d.onForegroundState(false);
  }

  /** Called when Settings change while the monitor is running. */
  applySettings(settings: AppSettings): void {
    this.settings = settings;
    this.controller?.updateConfig(toMonitorConfig(settings));
  }

  async buzz(seconds?: number): Promise<void> {
    if (this.controller === null) throw new Error('Monitoring is not running');
    await this.controller.buzz(seconds);
  }

  async stopBuzz(): Promise<void> {
    await this.controller?.stopBuzz();
  }

  // ---- internals -----------------------------------------------------------------------------

  private handleSnapshot(s: MonitorSnapshot): void {
    this.d.onSnapshot(s);
    // Refresh the permanent notification only when its text really changes.
    void this.refreshForeground(s);
  }

  private async refreshForeground(s: MonitorSnapshot): Promise<void> {
    // Cheap pre-check using the same fields that make up the text.
    const key = `${s.link}|${s.zone}|${s.batteryPct}|${s.bluetoothOn}|${s.monitoring}`;
    if (key === this.lastForegroundText || !s.monitoring) return;
    this.lastForegroundText = key;
    try {
      await this.d.showForeground(s, this.settings.childName, this.withLocation);
    } catch (e) {
      console.warn('[runtime] could not refresh the notification', e);
    }
  }

  private async handleAlert(e: AlertEvent): Promise<void> {
    const snap = this.controller?.snapshot;
    const opts: NotifyOptions = {
      childName: this.settings.childName,
      // The panic alert is always loud (Settings says so): the Sound and Vibration switches
      // only apply to range, connection and battery alerts.
      sound: e.type === 'panic' ? true : this.settings.soundOn,
      vibration: e.type === 'panic' ? true : this.settings.vibrationOn,
      safeRangeM: this.settings.safeRangeM,
      batteryPct: snap?.batteryPct ?? null,
    };
    // Notify and store at the same time: the parent must see the alert at once, and the alert must
    // not be lost if the app dies while the position is still being looked up.
    const [, id] = await Promise.all([
      this.d.showAlert(e, opts).catch((err: unknown) => console.warn('[runtime] notification failed', err)),
      this.d.insertAlert(e, null).catch((err: unknown) => {
        console.warn('[runtime] could not store the alert', err);
        return null;
      }),
    ]);
    this.d.onAlertsChanged();
    const fix = await this.d.currentFix();
    if (fix !== null && id !== null) {
      await this.d.setAlertLocation(id, fix).catch((err: unknown) => console.warn('[runtime] location not saved', err));
      this.d.onAlertsChanged();
    }
    await this.d.sync(this.settings.deviceId, this.settings.localOnly);
  }
}

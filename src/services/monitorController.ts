// src/services/monitorController.ts
// The brain of the monitor. It listens to a BleLink, runs the RSSI pipeline and the AlertEngine,
// and reports two things: the current snapshot (for the screens) and alert events (to be
// notified, stored and uploaded). It has no React Native imports, so it is tested with a fake link.
import { Defaults } from '../core/constants';
import { INITIAL_SNAPSHOT } from '../domain/types';
import type { AlertEvent, MonitorConfig, MonitorSnapshot } from '../domain/types';
import { AlertEngine } from './alertEngine';
import type { BleLink } from './bleTypes';
import { DistanceModel } from './distanceModel';
import type { Unsubscribe } from './emitter';
import { RssiFilter } from './rssiFilter';
import { ZoneTracker } from './zoneTracker';

export interface MonitorHooks {
  onSnapshot(snapshot: MonitorSnapshot): void;
  onAlert(event: AlertEvent): void;
}

export class MonitorController {
  private engine: AlertEngine;
  private model: DistanceModel;
  private readonly filter = new RssiFilter();
  private readonly zones = new ZoneTracker();
  private readonly subs: Unsubscribe[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private snap: MonitorSnapshot;
  private running = false;

  constructor(
    private readonly link: BleLink,
    private config: MonitorConfig,
    private readonly hooks: MonitorHooks,
    private readonly clock: () => number = Date.now,
  ) {
    this.engine = new AlertEngine({ safeRangeM: config.safeRangeM, clock });
    this.model = new DistanceModel(config.rssiAt1m, config.pathLossN);
    this.snap = { ...INITIAL_SNAPSHOT, safeRangeM: config.safeRangeM };
  }

  get snapshot(): MonitorSnapshot {
    return this.snap;
  }

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running || this.config.deviceId === null) return;
    this.running = true;
    this.set({ monitoring: true, link: 'searching' });

    this.subs.push(
      this.link.onBluetoothState((on) => this.set({ bluetoothOn: on })),
      this.link.onLink((up) => this.handleLink(up)),
      this.link.onReconnecting(() => {
        this.engine.onReconnecting();
        this.set({ link: this.engine.state });
      }),
      this.link.onRssi((dbm) => this.handleRssi(dbm)),
      this.link.onPanic((counter) => {
        this.markSeen();
        this.emit(this.engine.onPanic(counter));
      }),
      this.link.onBattery((pct) => {
        this.markSeen();
        this.set({ batteryPct: pct });
        this.emit(this.engine.onBattery(pct, this.snap.charging));
      }),
      this.link.onStatus((s) => {
        this.markSeen();
        this.set({ charging: s.charging });
        if (this.snap.batteryPct !== null) this.emit(this.engine.onBattery(this.snap.batteryPct, s.charging));
      }),
    );

    this.timer = setInterval(() => this.tick(), 1000);
    this.link.start(this.config.deviceId);
  }

  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    for (const u of this.subs.splice(0)) u();
    await this.link.stop();
    this.filter.reset();
    this.zones.reset();
    this.snap = { ...INITIAL_SNAPSHOT, safeRangeM: this.config.safeRangeM };
    this.hooks.onSnapshot(this.snap);
  }

  /** Called when Settings change. A different wearable restarts the link. */
  updateConfig(next: MonitorConfig): void {
    const deviceChanged = next.deviceId !== this.config.deviceId;
    this.config = next;
    this.engine.safeRangeM = next.safeRangeM;
    this.model = new DistanceModel(next.rssiAt1m, next.pathLossN);
    this.set({ safeRangeM: next.safeRangeM });
    if (deviceChanged && this.running && next.deviceId !== null) this.link.start(next.deviceId);
  }

  async buzz(seconds: number = Defaults.buzzSeconds): Promise<void> {
    await this.link.buzz(true, seconds);
    this.set({ buzzSecondsLeft: seconds });
    this.emit([{ type: 'buzzer', at: this.clock() }]);
  }

  async stopBuzz(): Promise<void> {
    await this.link.buzz(false, 0);
    this.set({ buzzSecondsLeft: 0 });
  }

  // ---- internals -----------------------------------------------------------------------------

  private handleLink(up: boolean): void {
    if (up) {
      this.engine.onConnected();
      this.filter.reset();
      this.zones.reset();
      this.set({ link: 'connected', lastSeen: this.clock() });
    } else {
      this.engine.onLinkDropped();
      this.set({ link: 'disconnected', distanceM: null, rssiDbm: null, buzzSecondsLeft: 0 });
    }
  }

  private handleRssi(dbm: number): void {
    const smoothed = this.filter.add(dbm);
    const metres = this.model.metres(smoothed);
    const events = this.engine.onDistance(metres);
    this.set({
      distanceM: metres,
      rssiDbm: smoothed,
      zone: this.zones.update(metres, this.config.safeRangeM),
      link: this.engine.state,
      lastSeen: this.clock(),
    });
    this.emit(events);
  }

  private tick(): void {
    const events = this.engine.onTick();
    const left = this.snap.buzzSecondsLeft > 0 ? this.snap.buzzSecondsLeft - 1 : 0;
    this.set({ link: this.engine.state, buzzSecondsLeft: left });
    this.emit(events);
  }

  private markSeen(): void {
    this.set({ lastSeen: this.clock() });
  }

  private emit(events: AlertEvent[]): void {
    for (const e of events) this.hooks.onAlert(e);
  }

  /** Publishes a snapshot only when something really changed. */
  private set(patch: Partial<MonitorSnapshot>): void {
    const next = { ...this.snap, ...patch };
    const changed = (Object.keys(patch) as (keyof MonitorSnapshot)[]).some((k) => next[k] !== this.snap[k]);
    if (!changed) return;
    this.snap = next;
    this.hooks.onSnapshot(next);
  }
}

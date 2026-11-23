// src/services/alertEngine.ts
import { Defaults } from '../core/constants';
import type { AlertEvent, LinkState } from '../domain/types';

export interface AlertEngineOptions {
  safeRangeM: number;
  outForSeconds?: number;
  rearmFraction?: number;
  lostAfterSeconds?: number;
  lowBatteryPct?: number;
  lowBatteryRearmPct?: number;
  /** Injected so the tests can run 30 seconds in a millisecond. */
  clock?: () => number;
}

/** Plain TypeScript, no React Native imports: every rule can be unit-tested with a fake clock. */
export class AlertEngine {
  safeRangeM: number; // changed from the Safe Range screen
  state: LinkState = 'searching';

  private readonly outForSeconds: number;
  private readonly rearmFraction: number;
  private readonly lostAfterSeconds: number;
  private readonly lowBatteryPct: number;
  private readonly lowBatteryRearmPct: number;
  private readonly now: () => number;

  private outSince: number | null = null;
  private lostSince: number | null = null;
  private lastPanicAt: number | null = null;
  private lastPanicCounter: number | null = null;
  private outAlerted = false;
  private lowBattAlerted = false;
  private lostAlerted = false;

  constructor(o: AlertEngineOptions) {
    this.safeRangeM = o.safeRangeM;
    this.outForSeconds = o.outForSeconds ?? Defaults.outForSeconds;
    this.rearmFraction = o.rearmFraction ?? Defaults.rearmFraction;
    this.lostAfterSeconds = o.lostAfterSeconds ?? Defaults.lostAfterSeconds;
    this.lowBatteryPct = o.lowBatteryPct ?? Defaults.lowBatteryPct;
    this.lowBatteryRearmPct = o.lowBatteryRearmPct ?? Defaults.lowBatteryRearmPct;
    this.now = o.clock ?? Date.now;
  }

  onConnected(): void {
    this.state = 'connected';
    this.lostSince = null;
    this.lostAlerted = false;
    this.outSince = null;
    this.outAlerted = false;
  }

  onLinkDropped(): void {
    this.state = 'disconnected';
    this.lostSince = this.now();
    this.lostAlerted = false;
    this.outSince = null;
  }

  onReconnecting(): void {
    if (this.state === 'disconnected') this.state = 'reconnecting';
  }

  /** Call for every smoothed distance sample (about once a second). */
  onDistance(metres: number): AlertEvent[] {
    if (this.state !== 'connected' && this.state !== 'outOfRange') return [];
    const events: AlertEvent[] = [];
    if (metres > this.safeRangeM) {
      this.outSince ??= this.now();
      if (!this.outAlerted && (this.now() - this.outSince) / 1000 >= this.outForSeconds) {
        this.outAlerted = true;
        this.state = 'outOfRange';
        events.push({ type: 'out_of_range', at: this.now(), distanceM: metres });
      }
    } else if (!this.outAlerted) {
      this.outSince = null; // the timer needs *continuous* time outside
    } else if (metres <= this.safeRangeM * this.rearmFraction) {
      this.outSince = null; // the alert clears only at 80% of the range
      this.outAlerted = false;
      this.state = 'connected';
    }
    return events;
  }

  /** Call once a second. */
  onTick(): AlertEvent[] {
    const lost = this.state === 'disconnected' || this.state === 'reconnecting';
    if (lost && this.lostSince !== null && (this.now() - this.lostSince) / 1000 >= this.lostAfterSeconds) {
      this.state = 'connectionLost';
      if (this.lostAlerted) return [];
      this.lostAlerted = true;
      return [{ type: 'connection_lost', at: this.now() }];
    }
    return [];
  }

  /** `charging` comes from the Status characteristic; no alert while charging. */
  onBattery(percent: number, charging = false): AlertEvent[] {
    if (percent >= this.lowBatteryRearmPct) this.lowBattAlerted = false;
    if (charging) return [];
    if (percent <= this.lowBatteryPct && !this.lowBattAlerted) {
      this.lowBattAlerted = true;
      return [{ type: 'low_battery', at: this.now() }];
    }
    return [];
  }

  onPanic(counter: number): AlertEvent[] {
    const t = this.now();
    const duplicate =
      this.lastPanicCounter === counter && this.lastPanicAt !== null && (t - this.lastPanicAt) / 1000 < 10;
    if (duplicate) return [];
    this.lastPanicCounter = counter;
    this.lastPanicAt = t;
    return [{ type: 'panic', at: t }];
  }
}

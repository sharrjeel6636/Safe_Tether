// A BleLink that the tests drive by hand.
import { describe, it, expect } from '@jest/globals';
import { Emitter } from '../src/services/emitter';
import type { BleLink } from '../src/services/bleTypes';
import type { WearableStatus } from '../src/services/wearableProtocol';

export class FakeBleLink implements BleLink {
  started: string[] = [];
  stopped = 0;
  buzzCalls: { on: boolean; seconds: number }[] = [];

  link = new Emitter<boolean>();
  rssi = new Emitter<number>();
  panic = new Emitter<number>();
  battery = new Emitter<number>();
  status = new Emitter<WearableStatus>();
  bt = new Emitter<boolean>();
  reconnecting = new Emitter<void>();

  start(id: string): void {
    this.started.push(id);
  }
  async stop(): Promise<void> {
    this.stopped++;
  }
  onLink = (l: (up: boolean) => void) => this.link.on(l);
  onRssi = (l: (d: number) => void) => this.rssi.on(l);
  onPanic = (l: (c: number) => void) => this.panic.on(l);
  onBattery = (l: (p: number) => void) => this.battery.on(l);
  onStatus = (l: (s: WearableStatus) => void) => this.status.on(l);
  onBluetoothState = (l: (on: boolean) => void) => this.bt.on(l);
  onReconnecting = (l: () => void) => this.reconnecting.on(l);
  async buzz(on: boolean, seconds: number): Promise<void> {
    this.buzzCalls.push({ on, seconds });
  }
}

describe('FakeBleLink helper', () => {
  it('instantiates successfully', () => {
    expect(new FakeBleLink()).toBeDefined();
  });
});

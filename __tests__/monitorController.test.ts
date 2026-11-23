import { DEFAULT_CONFIG } from '../src/domain/types';
import type { AlertEvent, MonitorConfig, MonitorSnapshot } from '../src/domain/types';
import { MonitorController } from '../src/services/monitorController';
import { FakeBleLink } from './fakeBleLink';

const CONFIG: MonitorConfig = { ...DEFAULT_CONFIG, deviceId: 'AA:BB:CC:DD:EE:FF', safeRangeM: 10 };

// With A = -59 and n = 2.5:  -59 dBm = 1 m,  -75 dBm = 4.4 m,  -90 dBm = 15.8 m.
function setup(config: MonitorConfig = CONFIG) {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-26T10:00:00Z'));
  const link = new FakeBleLink();
  const alerts: AlertEvent[] = [];
  let snap: MonitorSnapshot | null = null;
  const mc = new MonitorController(link, config, { onSnapshot: (s) => (snap = s), onAlert: (e) => alerts.push(e) });
  return { link, alerts, mc, snap: () => snap as MonitorSnapshot };
}

/** Feeds the same RSSI once a second for `seconds` seconds. */
function feed(t: ReturnType<typeof setup>, dbm: number, seconds: number) {
  for (let i = 0; i < seconds; i++) {
    t.link.rssi.emit(dbm);
    jest.advanceTimersByTime(1000);
  }
}

afterEach(() => {
  jest.useRealTimers();
});

describe('MonitorController', () => {
  it('does nothing without a saved wearable', () => {
    const t = setup({ ...CONFIG, deviceId: null });
    t.mc.start();
    expect(t.mc.isRunning).toBe(false);
    expect(t.link.started).toEqual([]);
  });

  it('starts the link and shows Searching until the wearable connects', () => {
    const t = setup();
    t.mc.start();
    expect(t.link.started).toEqual([CONFIG.deviceId]);
    expect(t.snap().monitoring).toBe(true);
    expect(t.snap().link).toBe('searching');
    t.link.link.emit(true);
    expect(t.snap().link).toBe('connected');
  });

  it('smooths RSSI into a distance and a zone', () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    feed(t, -75, 8);
    expect(t.snap().distanceM).toBeCloseTo(4.37, 1);
    expect(t.snap().zone).toBe('medium'); // 4.37 m is above 40 % of 10 m
    expect(t.snap().rssiDbm).toBeCloseTo(-75, 0);
  });

  it('raises one out-of-range alert after 4 s continuously outside the range', () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    feed(t, -90, 10);
    expect(t.alerts.filter((a) => a.type === 'out_of_range')).toHaveLength(1);
    expect(t.snap().link).toBe('outOfRange');
    expect(t.snap().zone).toBe('far');
  });

  it('clears the out-of-range state only at 80 % of the range', () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    feed(t, -90, 8);
    expect(t.snap().link).toBe('outOfRange');
    feed(t, -80, 12); // 6.9 m is below 80 % of the range (8 m), so the alert clears
    expect(t.snap().link).toBe('connected');
  });

  it('reports connection lost after 30 s without a link, once', () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    t.link.link.emit(false);
    expect(t.snap().link).toBe('disconnected');
    t.link.reconnecting.emit();
    expect(t.snap().link).toBe('reconnecting');
    jest.advanceTimersByTime(40_000);
    expect(t.alerts.filter((a) => a.type === 'connection_lost')).toHaveLength(1);
    expect(t.snap().link).toBe('connectionLost');
    expect(t.snap().distanceM).toBeNull();
  });

  it('turns a panic notification into one alert and ignores a duplicate counter', () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    t.link.panic.emit(7);
    t.link.panic.emit(7);
    expect(t.alerts.filter((a) => a.type === 'panic')).toHaveLength(1);
    jest.advanceTimersByTime(11_000);
    t.link.panic.emit(8);
    expect(t.alerts.filter((a) => a.type === 'panic')).toHaveLength(2);
  });

  it('alerts at 20 % battery, but not while charging', () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    t.link.status.emit({ charging: true, lowBattery: false, fwMajor: 1, fwMinor: 0 });
    t.link.battery.emit(15);
    expect(t.alerts.filter((a) => a.type === 'low_battery')).toHaveLength(0);
    t.link.status.emit({ charging: false, lowBattery: true, fwMajor: 1, fwMinor: 0 });
    expect(t.alerts.filter((a) => a.type === 'low_battery')).toHaveLength(1);
    expect(t.snap().batteryPct).toBe(15);
  });

  it('counts the buzzer down and logs it', async () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    await t.mc.buzz(5);
    expect(t.link.buzzCalls).toEqual([{ on: true, seconds: 5 }]);
    expect(t.snap().buzzSecondsLeft).toBe(5);
    expect(t.alerts.map((a) => a.type)).toContain('buzzer');
    jest.advanceTimersByTime(2000);
    expect(t.snap().buzzSecondsLeft).toBe(3);
    await t.mc.stopBuzz();
    expect(t.link.buzzCalls[1]).toEqual({ on: false, seconds: 0 });
    expect(t.snap().buzzSecondsLeft).toBe(0);
  });

  it('applies a new safe range and a new wearable at once', () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    t.mc.updateConfig({ ...CONFIG, safeRangeM: 5, deviceId: '11:22:33:44:55:66' });
    expect(t.snap().safeRangeM).toBe(5);
    expect(t.link.started).toEqual([CONFIG.deviceId, '11:22:33:44:55:66']);
    feed(t, -75, 8); // 4.4 m is now inside 5 m but above 40 %
    expect(t.alerts.filter((a) => a.type === 'out_of_range')).toHaveLength(0);
  });

  it('stops cleanly and resets the snapshot', async () => {
    const t = setup();
    t.mc.start();
    t.link.link.emit(true);
    feed(t, -70, 3);
    await t.mc.stop();
    expect(t.link.stopped).toBe(1);
    expect(t.snap().monitoring).toBe(false);
    expect(t.snap().distanceM).toBeNull();
    t.link.rssi.emit(-70); // listeners are gone
    expect(t.snap().distanceM).toBeNull();
  });

  it('shows Bluetooth off', () => {
    const t = setup();
    t.mc.start();
    t.link.bt.emit(false);
    expect(t.snap().bluetoothOn).toBe(false);
  });
});

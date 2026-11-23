import { DEFAULT_SETTINGS } from '../src/data/settingsStore';
import type { AppSettings } from '../src/data/settingsStore';
import type { AlertEvent, MonitorSnapshot } from '../src/domain/types';
import type { Fix } from '../src/services/location';
import { MonitorRuntime } from '../src/services/monitorRuntime';
import type { RuntimeDeps } from '../src/services/monitorRuntime';
import type { NotifyOptions } from '../src/services/notifier';
import { FakeBleLink } from './fakeBleLink';

const SETTINGS: AppSettings = { ...DEFAULT_SETTINGS, deviceId: 'AA:BB', childName: 'Sara', safeRangeM: 10 };
const FIX: Fix = { lat: 31.5204, lng: 74.3587, accuracyM: 12 };

function setup(over: Partial<RuntimeDeps> = {}) {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-26T10:00:00Z'));
  const link = new FakeBleLink();
  const log = {
    shown: [] as { e: AlertEvent; o: NotifyOptions }[],
    stored: [] as { e: AlertEvent; fix: Fix | null }[],
    located: [] as { id: number; fix: Fix }[],
    foreground: [] as string[],
    syncs: 0,
    changed: 0,
    fgState: [] as boolean[],
    snaps: [] as MonitorSnapshot[],
  };
  const deps: RuntimeDeps = {
    link,
    checkPermissions: async () => ({ bluetooth: true, location: true, notifications: true }),
    showForeground: async (s, child, loc) => {
      log.foreground.push(`${child}|${s.link}|${loc}`);
    },
    stopForeground: async () => {
      log.foreground.push('stop');
    },
    showAlert: async (e, o) => {
      log.shown.push({ e, o });
    },
    currentFix: async () => FIX,
    insertAlert: async (e, fix) => {
      log.stored.push({ e, fix });
      return log.stored.length;
    },
    setAlertLocation: async (id, fix) => {
      log.located.push({ id, fix });
    },
    sync: async () => {
      log.syncs++;
    },
    onSnapshot: (s) => log.snaps.push(s),
    onAlertsChanged: () => log.changed++,
    onForegroundState: (r) => log.fgState.push(r),
    ...over,
  };
  return { rt: new MonitorRuntime(deps), link, log };
}

const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

afterEach(() => jest.useRealTimers());

describe('MonitorRuntime', () => {
  it('refuses to start without a saved wearable', async () => {
    const t = setup();
    expect(await t.rt.start({ ...SETTINGS, deviceId: null })).toBe('no-device');
    expect(t.link.started).toEqual([]);
  });

  it('refuses to start without Bluetooth or notification permission', async () => {
    const t = setup({ checkPermissions: async () => ({ bluetooth: true, location: true, notifications: false }) });
    expect(await t.rt.start(SETTINGS)).toBe('no-permission');
    expect(t.log.foreground).toEqual([]);
  });

  it('starts the foreground service first, then the link, and syncs', async () => {
    const t = setup();
    expect(await t.rt.start(SETTINGS)).toBe('started');
    expect(t.log.foreground[0]).toBe('Sara|searching|true');
    expect(t.link.started).toEqual(['AA:BB']);
    expect(t.log.fgState).toEqual([true]);
    expect(t.log.syncs).toBe(1);
    expect(await t.rt.start(SETTINGS)).toBe('already-running');
  });

  it('still monitors when the foreground service cannot start, and says so', async () => {
    const t = setup({
      showForeground: async () => {
        throw new Error('SecurityException');
      },
    });
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(await t.rt.start(SETTINGS)).toBe('started');
    expect(t.log.fgState).toEqual([false]);
    expect(t.link.started).toHaveLength(1);
  });

  it('notifies, stores and then adds the position for a panic', async () => {
    const t = setup();
    await t.rt.start(SETTINGS);
    t.link.link.emit(true);
    t.link.panic.emit(3);
    await flush();
    expect(t.log.shown).toHaveLength(1);
    expect(t.log.shown[0]?.e.type).toBe('panic');
    expect(t.log.shown[0]?.o).toMatchObject({ childName: 'Sara', sound: true, vibration: true, safeRangeM: 10 });
    expect(t.log.stored).toHaveLength(1);
    expect(t.log.stored[0]?.fix).toBeNull(); // stored first, position added afterwards
    expect(t.log.located).toEqual([{ id: 1, fix: FIX }]);
    expect(t.log.changed).toBe(2);
    expect(t.log.syncs).toBeGreaterThanOrEqual(2);
  });

  it('keeps the panic alert loud even when Sound and Vibration are switched off', async () => {
    const t = setup();
    await t.rt.start({ ...SETTINGS, soundOn: false, vibrationOn: false });
    t.link.link.emit(true);
    t.link.panic.emit(7);
    await flush();
    expect(t.log.shown[0]?.e.type).toBe('panic');
    expect(t.log.shown[0]?.o).toMatchObject({ sound: true, vibration: true });
  });

  it('keeps the alert when there is no position fix', async () => {
    const t = setup({ currentFix: async () => null });
    await t.rt.start(SETTINGS);
    t.link.link.emit(true);
    t.link.panic.emit(1);
    await flush();
    expect(t.log.stored).toHaveLength(1);
    expect(t.log.located).toEqual([]);
  });

  it('survives a failing notification or database', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const t = setup({
      showAlert: async () => {
        throw new Error('no permission');
      },
      insertAlert: async () => {
        throw new Error('disk full');
      },
    });
    await t.rt.start(SETTINGS);
    t.link.link.emit(true);
    t.link.panic.emit(1);
    await flush();
    expect(t.log.located).toEqual([]); // nothing to attach the position to, and no crash
  });

  it('updates the permanent notification only when its text would change', async () => {
    const t = setup();
    await t.rt.start(SETTINGS);
    const before = t.log.foreground.length;
    t.link.link.emit(true); // searching -> connected
    await flush();
    expect(t.log.foreground.length).toBe(before + 1);
    t.link.rssi.emit(-70); // about 2.8 m: zone "near", same as before
    await flush();
    const afterFirstRssi = t.log.foreground.length;
    t.link.rssi.emit(-70);
    t.link.rssi.emit(-70);
    await flush();
    expect(t.log.foreground.length).toBe(afterFirstRssi); // same zone: no extra notification update
  });

  it('passes a new safe range to the running monitor and stops everything on stop()', async () => {
    const t = setup();
    await t.rt.start(SETTINGS);
    t.link.link.emit(true);
    t.rt.applySettings({ ...SETTINGS, safeRangeM: 5 });
    expect(t.log.snaps[t.log.snaps.length - 1]?.safeRangeM).toBe(5);
    await t.rt.stop();
    expect(t.link.stopped).toBe(1);
    expect(t.log.foreground[t.log.foreground.length - 1]).toBe('stop');
    expect(t.rt.running).toBe(false);
    expect(t.log.fgState[t.log.fgState.length - 1]).toBe(false);
  });

  it('buzzes through the link and rejects when not running', async () => {
    const t = setup();
    await expect(t.rt.buzz()).rejects.toThrow('not running');
    await t.rt.start(SETTINGS);
    await t.rt.buzz(10);
    expect(t.link.buzzCalls).toEqual([{ on: true, seconds: 10 }]);
  });
});

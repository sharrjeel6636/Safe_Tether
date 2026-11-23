import { AlertEngine } from '../src/services/alertEngine';

function make(range = 5) {
  let t = new Date('2026-01-01T00:00:00Z').getTime();
  const engine = new AlertEngine({ safeRangeM: range, clock: () => t });
  return { e: engine, advance: (s: number) => { t += s * 1000; } };
}

describe('AlertEngine', () => {
  test('out-of-range fires only after 4 s of continuous time outside', () => {
    const { e, advance } = make();
    e.onConnected();
    expect(e.onDistance(6)).toEqual([]);
    advance(3);
    expect(e.onDistance(6)).toEqual([]);
    advance(1);
    const ev = e.onDistance(6);
    expect(ev).toHaveLength(1);
    expect(ev[0]?.type).toBe('out_of_range');
    advance(1);
    expect(e.onDistance(7)).toEqual([]); // no repeat while still out
  });

  test('stepping back inside before 4 s restarts the timer', () => {
    const { e, advance } = make();
    e.onConnected();
    e.onDistance(6);
    advance(3);
    e.onDistance(4); // inside again: timer cleared
    advance(3);
    expect(e.onDistance(6)).toEqual([]); // a new excursion starts now
    advance(3);
    expect(e.onDistance(6)).toEqual([]); // only 3 s into the new excursion
  });

  test('alert clears only below 80% of the range', () => {
    const { e, advance } = make();
    e.onConnected();
    e.onDistance(6);
    advance(4);
    e.onDistance(6);
    e.onDistance(4.5);
    expect(e.state).toBe('outOfRange'); // 4.5 m is above 4.0 m
    e.onDistance(3.9);
    expect(e.state).toBe('connected');
  });

  test('connection-lost alert after 30 s, not before, and only once', () => {
    const { e, advance } = make();
    e.onConnected();
    e.onLinkDropped();
    e.onReconnecting();
    advance(29);
    expect(e.onTick()).toEqual([]);
    advance(1);
    const ev = e.onTick();
    expect(ev).toHaveLength(1);
    expect(ev[0]?.type).toBe('connection_lost');
    advance(5);
    expect(e.onTick()).toEqual([]);
    expect(e.state).toBe('connectionLost');
  });

  test('reconnecting before 30 s cancels the lost timer', () => {
    const { e, advance } = make();
    e.onConnected();
    e.onLinkDropped();
    advance(20);
    e.onConnected();
    advance(20);
    expect(e.onTick()).toEqual([]);
    expect(e.state).toBe('connected');
  });

  test('low battery fires once at 20 %, re-arms above 25 %', () => {
    const { e } = make();
    expect(e.onBattery(30)).toEqual([]);
    expect(e.onBattery(20)[0]?.type).toBe('low_battery');
    expect(e.onBattery(18)).toEqual([]); // not again
    expect(e.onBattery(22)).toEqual([]); // between 20 and 25: still not re-armed
    expect(e.onBattery(26)).toEqual([]); // re-armed here
    expect(e.onBattery(19)[0]?.type).toBe('low_battery');
  });

  test('no low-battery alert while charging', () => {
    const { e } = make();
    expect(e.onBattery(10, true)).toEqual([]);
    expect(e.onBattery(10)[0]?.type).toBe('low_battery'); // unplugged: now it fires
  });

  test('panic: the same counter within 10 s is a duplicate', () => {
    const { e, advance } = make();
    expect(e.onPanic(7)[0]?.type).toBe('panic');
    advance(2);
    expect(e.onPanic(7)).toEqual([]); // repeated notification of the same press
    expect(e.onPanic(8)[0]?.type).toBe('panic'); // a new press
  });

  test('panic works in any state', () => {
    const { e } = make();
    e.onLinkDropped();
    expect(e.onPanic(1)[0]?.type).toBe('panic');
  });

  test('changing the safe range applies to the next reading', () => {
    const { e, advance } = make();
    e.onConnected();
    e.safeRangeM = 20;
    advance(10);
    expect(e.onDistance(10)).toEqual([]); // 10 m is inside 20 m
  });

  test('no distance alerts while the link is down', () => {
    const { e, advance } = make();
    e.onLinkDropped();
    advance(10);
    expect(e.onDistance(50)).toEqual([]);
  });
});

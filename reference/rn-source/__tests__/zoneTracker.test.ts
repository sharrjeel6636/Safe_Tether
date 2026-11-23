import { ZoneTracker } from '../src/services/zoneTracker';

describe('ZoneTracker', () => {
  test('zones follow the distance, with a margin when moving back', () => {
    const z = new ZoneTracker(); // range 10 m: near edge 4 m, far edge 10 m
    expect(z.update(3, 10)).toBe('near');
    expect(z.update(4.5, 10)).toBe('medium');
    expect(z.update(3.8, 10)).toBe('medium'); // still medium: needs < 3.6 m
    expect(z.update(3.5, 10)).toBe('near');
    expect(z.update(10.5, 10)).toBe('far');
    expect(z.update(9.5, 10)).toBe('far'); // still far: needs < 9 m
    expect(z.update(8.9, 10)).toBe('medium');
  });

  test('a reading jittering around an edge does not flicker', () => {
    const z = new ZoneTracker();
    z.update(4.5, 10); // medium
    let changes = 0;
    let last = z.zone;
    for (const d of [4.1, 3.9, 4.2, 3.8, 4.1, 3.95]) {
      const now = z.update(d, 10);
      if (now !== last) changes++;
      last = now;
    }
    expect(changes).toBe(0);
  });
});

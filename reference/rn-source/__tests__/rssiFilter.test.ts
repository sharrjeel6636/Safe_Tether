import { RssiFilter } from '../src/services/rssiFilter';

describe('RssiFilter', () => {
  test('a single outlier does not move the output', () => {
    const f = new RssiFilter();
    let last = 0;
    for (const r of [-60, -60, -60, -90, -60]) last = f.add(r);
    expect(last).toBeCloseTo(-60, 2);
  });

  test('a real change is followed, but smoothly', () => {
    const f = new RssiFilter();
    for (let i = 0; i < 5; i++) f.add(-60);
    const first = f.add(-80);
    expect(first).toBeCloseTo(-60, 2); // the median still says -60
    let v = first;
    for (let i = 0; i < 20; i++) v = f.add(-80);
    expect(v).toBeLessThan(-79); // after enough samples it has moved to -80
  });

  test('reset forgets the history', () => {
    const f = new RssiFilter();
    f.add(-50);
    f.reset();
    expect(f.add(-80)).toBeCloseTo(-80, 2);
  });
});

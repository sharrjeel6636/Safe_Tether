import { ago, dayHeader, formatMetres } from '../src/core/format';

describe('format', () => {
  test('ago', () => {
    const now = 1_000_000_000_000;
    expect(ago(null, now)).toBe('never');
    expect(ago(now - 2000, now)).toBe('just now');
    expect(ago(now - 12_000, now)).toBe('12 s ago');
    expect(ago(now - 300_000, now)).toBe('5 min ago');
    expect(ago(now - 7_200_000, now)).toBe('2 h ago');
  });

  test('dayHeader', () => {
    const now = new Date(2026, 9, 26, 15, 0);
    expect(dayHeader(new Date(2026, 9, 26, 1, 0), now)).toBe('Today');
    expect(dayHeader(new Date(2026, 9, 25, 23, 0), now)).toBe('Yesterday');
    expect(dayHeader(new Date(2026, 9, 20, 9, 0), now)).toBe('20 Oct 2026');
  });

  test('formatMetres', () => {
    expect(formatMetres(null)).toBe('-');
    expect(formatMetres(0.4)).toBe('< 1 m');
    expect(formatMetres(4.37)).toBe('4 m');
  });
});

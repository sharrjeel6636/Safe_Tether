import { latLngToWorldPixel, metresPerPixel, tileView } from '../src/services/mapTiles';

describe('mapTiles', () => {
  test('the origin of the world is at the top-left', () => {
    const p = latLngToWorldPixel(0, 0, 1);
    expect(p.x).toBeCloseTo(256, 3);
    expect(p.y).toBeCloseTo(256, 3);
  });

  test('a known tile: Lahore at zoom 12 is tile 2894/1669 (checked with the asinh formula)', () => {
    // 31.5204 N, 74.3587 E
    const v = tileView(31.5204, 74.3587, 12);
    expect(v.tiles[4]).toMatchObject({ x: 2894, y: 1669 });
    expect(v.tiles[4]?.url).toBe('https://tile.openstreetmap.org/12/2894/1669.png');
  });

  test('the pin sits inside the middle tile', () => {
    const v = tileView(24.8607, 67.0011, 16);
    expect(v.pinX).toBeGreaterThanOrEqual(256);
    expect(v.pinX).toBeLessThan(512);
    expect(v.pinY).toBeGreaterThanOrEqual(256);
    expect(v.pinY).toBeLessThan(512);
    expect(v.tiles).toHaveLength(9);
  });

  test('resolution at the equator and zoom 16 is about 2.39 m per pixel', () => {
    expect(metresPerPixel(0, 16)).toBeCloseTo(2.39, 2);
  });
});

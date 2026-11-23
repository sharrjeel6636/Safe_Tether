import { DistanceModel } from '../src/services/distanceModel';

describe('DistanceModel', () => {
  test('the RSSI measured at 1 m gives 1.0 m', () => {
    expect(new DistanceModel().metres(-59)).toBeCloseTo(1.0, 4);
  });

  test('-75 dBm with A = -59 and n = 2.5 gives about 4.4 m (the figure used in the doc)', () => {
    expect(new DistanceModel().metres(-75)).toBeCloseTo(4.37, 2);
  });

  test('weaker signal means larger distance', () => {
    const m = new DistanceModel();
    expect(m.metres(-80)).toBeGreaterThan(m.metres(-70));
  });

  test('calibration moves the curve', () => {
    expect(new DistanceModel(-50).metres(-50)).toBeCloseTo(1.0, 4);
  });
});

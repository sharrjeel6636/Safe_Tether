import { base64ToBytes, bytesToBase64 } from '../src/services/base64';
import { buzzPayload, parseBattery, parsePanic, parseStatus } from '../src/services/wearableProtocol';

describe('base64', () => {
  test('matches the reference encoder for every length', () => {
    for (let len = 0; len < 12; len++) {
      const bytes = Array.from({ length: len }, (_, i) => (i * 37 + 11) & 0xff);
      expect(bytesToBase64(bytes)).toBe(Buffer.from(bytes).toString('base64'));
      expect(base64ToBytes(Buffer.from(bytes).toString('base64'))).toEqual(bytes);
    }
  });

  test('decodes the two payloads of the contract', () => {
    expect(base64ToBytes('AQc=')).toEqual([1, 7]); // panic pressed, counter 7
    expect(bytesToBase64([1, 30])).toBe('AR4=');
  });

  test('garbage and empty input give an empty array', () => {
    expect(base64ToBytes('')).toEqual([]);
    expect(base64ToBytes(null)).toEqual([]);
  });
});

describe('wearable protocol', () => {
  test('status flags', () => {
    expect(parseStatus([1, 0, 1])).toEqual({ charging: true, lowBattery: false, fwMajor: 0, fwMinor: 1 });
    expect(parseStatus([2])).toMatchObject({ charging: false, lowBattery: true });
    expect(parseStatus([])).toMatchObject({ charging: false, lowBattery: false });
  });

  test('panic payload is [1, counter]; anything else is ignored', () => {
    expect(parsePanic([1, 9])).toBe(9);
    expect(parsePanic([0, 9])).toBeNull();
    expect(parsePanic([1])).toBeNull();
  });

  test('battery is clamped to 0..100', () => {
    expect(parseBattery([55])).toBe(55);
    expect(parseBattery([200])).toBe(100);
    expect(parseBattery([])).toBeNull();
  });

  test('buzz payload is limited to 1..120 s like the firmware', () => {
    expect(buzzPayload(true, 30)).toEqual([1, 30]);
    expect(buzzPayload(true, 999)).toEqual([1, 120]);
    expect(buzzPayload(false, 30)).toEqual([0]);
  });
});

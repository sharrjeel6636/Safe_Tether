// src/services/base64.ts
// react-native-ble-plx sends and receives characteristic values as Base64 strings. Hermes has
// no Buffer, so these two small functions do the conversion (and are unit-tested).

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: readonly number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = (bytes[i] as number) & 0xff;
    const has1 = i + 1 < bytes.length;
    const has2 = i + 2 < bytes.length;
    const b1 = has1 ? (bytes[i + 1] as number) & 0xff : 0;
    const b2 = has2 ? (bytes[i + 2] as number) & 0xff : 0;
    out += CHARS[b0 >> 2];
    out += CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    out += has1 ? CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += has2 ? CHARS[b2 & 63] : '=';
  }
  return out;
}

export function base64ToBytes(b64: string | null | undefined): number[] {
  if (!b64) return [];
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const out: number[] = [];
  let buf = 0;
  let bits = 0;
  for (const ch of clean) {
    buf = (buf << 6) | CHARS.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buf >> bits) & 0xff);
    }
  }
  return out;
}

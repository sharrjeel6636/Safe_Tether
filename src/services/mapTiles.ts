// src/services/mapTiles.ts
// OpenStreetMap needs no key and no card. The "Last location" screen draws a 3 x 3 block of
// raster tiles and puts the pin on top, using this arithmetic ("slippy map" tile numbers).

export const TILE_SIZE = 256;

export interface TileView {
  zoom: number;
  /** Tiles of the 3 x 3 block, row by row. */
  tiles: { x: number; y: number; url: string }[];
  /** Pin position in pixels inside the 3 x 3 block (768 x 768). */
  pinX: number;
  pinY: number;
  size: number;
}

export function latLngToWorldPixel(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const clamped = Math.max(-85.0511, Math.min(85.0511, lat));
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sin = Math.sin((clamped * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
  return { x, y };
}

/** Metres per pixel at a latitude and zoom (for the accuracy circle). */
export function metresPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

export function tileView(lat: number, lng: number, zoom = 16): TileView {
  const { x, y } = latLngToWorldPixel(lat, lng, zoom);
  const cx = Math.floor(x / TILE_SIZE);
  const cy = Math.floor(y / TILE_SIZE);
  const max = Math.pow(2, zoom);
  const tiles: TileView['tiles'] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = (((cx + dx) % max) + max) % max;
      const ty = cy + dy;
      tiles.push({ x: tx, y: ty, url: `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png` });
    }
  }
  return {
    zoom,
    tiles,
    pinX: x - (cx - 1) * TILE_SIZE,
    pinY: y - (cy - 1) * TILE_SIZE,
    size: TILE_SIZE * 3,
  };
}

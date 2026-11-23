// src/services/rssiFilter.ts

/** Median of the last `window` readings, then an exponential moving average. */
export class RssiFilter {
  private readonly buf: number[] = [];
  private ema: number | null = null;

  constructor(
    private readonly window = 5,
    private readonly alpha = 0.3,
  ) {}

  add(rssi: number): number {
    this.buf.push(rssi);
    if (this.buf.length > this.window) this.buf.shift();
    const sorted = [...this.buf].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] as number;
    const next = this.ema === null ? median : this.alpha * median + (1 - this.alpha) * this.ema;
    this.ema = next;
    return next;
  }

  reset(): void {
    this.buf.length = 0;
    this.ema = null;
  }
}

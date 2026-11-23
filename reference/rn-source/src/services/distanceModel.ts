// src/services/distanceModel.ts
import { Defaults } from '../core/constants';

/** Log-distance path-loss model: d = 10^((A - RSSI) / (10 * n)). */
export class DistanceModel {
  constructor(
    readonly rssiAt1m: number = Defaults.rssiAt1m,
    readonly n: number = Defaults.pathLossN,
  ) {}

  metres(rssi: number): number {
    return Math.pow(10, (this.rssiAt1m - rssi) / (10 * this.n));
  }
}

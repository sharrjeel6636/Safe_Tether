// src/services/zoneTracker.ts
import { Defaults } from '../core/constants';
import type { Zone } from '../domain/types';

/**
 * Turns a distance into Near / Medium / Far without flickering at the edges.
 * Moving outwards happens at the edge; moving back needs a margin (hysteresis).
 */
export class ZoneTracker {
  private current: Zone = 'near';

  constructor(private readonly hysteresis: number = Defaults.zoneHysteresis) {}

  get zone(): Zone {
    return this.current;
  }

  reset(): void {
    this.current = 'near';
  }

  update(metres: number, safeRangeM: number): Zone {
    const nearEdge = safeRangeM * Defaults.zoneNearFraction;
    const farEdge = safeRangeM;
    const back = 1 - this.hysteresis;
    switch (this.current) {
      case 'near':
        if (metres > farEdge) this.current = 'far';
        else if (metres > nearEdge) this.current = 'medium';
        break;
      case 'medium':
        if (metres > farEdge) this.current = 'far';
        else if (metres < nearEdge * back) this.current = 'near';
        break;
      case 'far':
        if (metres < farEdge * back) this.current = metres < nearEdge * back ? 'near' : 'medium';
        break;
    }
    return this.current;
  }
}

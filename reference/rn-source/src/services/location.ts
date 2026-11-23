// src/services/location.ts
// One position fix at the moment of an alert (not continuous tracking: that would drain the battery).
import * as Location from 'expo-location';

export interface Fix {
  lat: number;
  lng: number;
  accuracyM: number | null;
}

const toFix = (l: Location.LocationObject): Fix => ({
  lat: l.coords.latitude,
  lng: l.coords.longitude,
  accuracyM: l.coords.accuracy ?? null,
});

/** A fresh fix within `timeoutMs`, else the last known one (up to 10 minutes old), else null. */
export async function currentFix(timeoutMs = 8_000): Promise<Fix | null> {
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (!perm.granted) return null;
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    const fresh = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Balanced }),
      timeout,
    ]);
    if (fresh !== null) return toFix(fresh);
    const last = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60_000 });
    return last === null ? null : toFix(last);
  } catch (e) {
    console.warn('[location] no fix', e);
    return null;
  }
}

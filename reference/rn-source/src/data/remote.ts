// src/data/remote.ts
// The Firestore side of the app. The phone database is the source of truth and works offline;
// this module copies data to and from the cloud. Collections and rules: Appendix D.
//   users/{uid}  children/{uid}  devices/{wearableId}  alerts/{alertId}
import {
  Timestamp,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import type { AlertRow } from '../domain/types';
import { addRemoteAlert } from './alertRepo';
import { remoteAlertId } from './alertRows';
import { currentUser } from './auth';

export class RemoteError extends Error {}
/** "This wearable is already paired to another account" (FR2). */
export class DeviceClaimedError extends RemoteError {
  constructor() {
    super('This wearable is already paired to another account.');
  }
}

export { remoteAlertId };

function uid(): string {
  const u = currentUser();
  if (u === null) throw new RemoteError('Please log in first.');
  return u.uid;
}

function mapFirestoreError(e: unknown): Error {
  const code = typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: unknown }).code) : '';
  if (code.includes('permission-denied')) return new DeviceClaimedError();
  if (code.includes('unavailable')) return new RemoteError('Internet is needed for this. Try again when you are online.');
  return e instanceof Error ? e : new RemoteError('Something went wrong.');
}

// ---- profile and wearable claim (FR2, FR14) ------------------------------------------------

export async function saveProfile(p: { name: string; age: string; note: string; deviceId: string | null }): Promise<void> {
  const id = uid();
  await setDoc(
    doc(getFirestore(), 'children', id),
    { ownerUid: id, name: p.name, age: p.age, note: p.note, deviceId: p.deviceId, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * One wearable, one parent. The document id is the wearable id; the rules allow creating it only
 * once, so a second parent is refused. A transaction fails at once when offline instead of
 * queueing silently.
 */
export async function claimDevice(deviceId: string): Promise<void> {
  const id = uid();
  const db = getFirestore();
  const ref = doc(db, 'devices', deviceId);
  try {
    await runTransaction(db, async (tx) => {
      tx.set(ref, { ownerUid: id, childId: id, claimedAt: serverTimestamp() });
    });
  } catch (e) {
    throw mapFirestoreError(e);
  }
}

/** Un-pair: frees the wearable so another account can claim it. */
export async function releaseDevice(deviceId: string): Promise<void> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new RemoteError('Internet is needed to unpair. Try again when you are online.')), 10_000),
  );
  await Promise.race([deleteDoc(doc(getFirestore(), 'devices', deviceId)), timeout]);
}

// ---- alert sync (offline first) ------------------------------------------------------------

/** Hands one alert to Firestore, which queues it offline; "done" here means "handed over", not "confirmed". */
export async function pushAlert(deviceId: string, row: AlertRow): Promise<string> {
  const id = uid();
  const remoteId = remoteAlertId(deviceId, row.at, row.type);
  // Not awaited: while offline Firestore keeps the write in its own queue and the promise only
  // resolves once the server confirms, which would block the sync loop for hours.
  void setDoc(doc(getFirestore(), 'alerts', remoteId), {
    ownerUid: id,
    childId: id,
    deviceId,
    type: row.type,
    at: Timestamp.fromMillis(row.at),
    distanceM: row.distanceM,
    lat: row.lat,
    lng: row.lng,
    accuracyM: row.accuracyM,
    createdAt: serverTimestamp(),
  }).catch((e: unknown) => console.warn('[remote] alert write rejected', e));
  return remoteId;
}

/** Downloads alerts created on another phone of the same account. No orderBy, so no index is needed. */
export async function pullAlerts(max = 200): Promise<number> {
  const snap = await getDocs(query(collection(getFirestore(), 'alerts'), where('ownerUid', '==', uid()), limit(max)));
  for (const d of snap.docs) {
    const m = d.data();
    const at = m.at;
    if (!(at instanceof Timestamp)) continue;
    await addRemoteAlert({
      remoteId: d.id,
      type: typeof m.type === 'string' ? m.type : 'unknown',
      at: at.toMillis(),
      distanceM: typeof m.distanceM === 'number' ? m.distanceM : null,
      lat: typeof m.lat === 'number' ? m.lat : null,
      lng: typeof m.lng === 'number' ? m.lng : null,
      accuracyM: typeof m.accuracyM === 'number' ? m.accuracyM : null,
    });
  }
  return snap.docs.length;
}

// ---- delete (FR22, FR21) -------------------------------------------------------------------

async function deleteWhereOwner(name: string): Promise<void> {
  const owner = uid();
  const db = getFirestore();
  for (;;) {
    const snap = await getDocs(query(collection(db, name), where('ownerUid', '==', owner), limit(400)));
    if (snap.empty) return;
    const batch = writeBatch(db);
    for (const d of snap.docs) batch.delete(d.ref);
    await batch.commit();
  }
}

/** "Clear history": the cloud copy (the caller also clears the phone database). */
export const deleteAllAlerts = (): Promise<void> => deleteWhereOwner('alerts');

/** "Delete account and data": everything of this parent in Firestore. */
export async function deleteAccountData(): Promise<void> {
  const id = uid();
  await deleteWhereOwner('alerts');
  await deleteWhereOwner('devices');
  await deleteDoc(doc(getFirestore(), 'children', id));
  await deleteDoc(doc(getFirestore(), 'users', id));
}

// ---- optional: push to a second parent (Appendix D.4) --------------------------------------

export async function registerFcmToken(): Promise<void> {
  const token = await getToken(getMessaging());
  await setDoc(doc(getFirestore(), 'users', uid()), { fcmTokens: arrayUnion(token) }, { merge: true });
}

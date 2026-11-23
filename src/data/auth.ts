// src/data/auth.ts
// Firebase Auth, email and password only (FR1, FR21). Firebase keeps the session,
// so the parent stays logged in after a restart.
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
}

/**
 * Firebase needs google-services.json (Appendix C.1). Without it getAuth() throws; the app then
 * still runs in "without an account" mode, which is useful for testing Bluetooth first.
 */
export function firebaseReady(): boolean {
  try {
    getAuth();
    return true;
  } catch {
    return false;
  }
}

export function currentUser(): AuthUser | null {
  try {
    const u = getAuth().currentUser;
    return u === null ? null : { uid: u.uid, email: u.email };
  } catch {
    return null;
  }
}

/** Calls back with the user now and on every change; returns the unsubscribe function. */
export function watchAuth(cb: (u: AuthUser | null) => void): () => void {
  try {
    return onAuthStateChanged(getAuth(), (u) => cb(u === null ? null : { uid: u.uid, email: u.email }));
  } catch {
    cb(null);
    return () => undefined;
  }
}

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(getAuth(), email.trim(), password);

export const register = (email: string, password: string) =>
  createUserWithEmailAndPassword(getAuth(), email.trim(), password);

export const resetPassword = (email: string) => sendPasswordResetEmail(getAuth(), email.trim());

export const logOut = () => signOut(getAuth());

/** Deleting an account is sensitive: Firebase wants a recent login, so ask for the password again. */
export async function reauthenticate(password: string): Promise<void> {
  const user = getAuth().currentUser;
  if (user === null || user.email === null) throw new Error('Not signed in');
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
}

export async function deleteAuthUser(): Promise<void> {
  const user = getAuth().currentUser;
  if (user !== null) await deleteUser(user);
}

export { friendlyAuthError } from './authMessages';

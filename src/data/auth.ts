import * as authModule from '@react-native-firebase/auth';
import { clearCloudData } from './remote';

const auth = (authModule as any).default || authModule;

export function isFirebaseConfigured(): boolean {
  try {
    const instance = auth();
    return !!instance;
  } catch {
    return false;
  }
}

export async function signInWithEmail(email: string, pass: string) {
  const userCredential = await auth().signInWithEmailAndPassword(email, pass);
  return userCredential.user;
}

export async function signUpWithEmail(email: string, pass: string) {
  const userCredential = await auth().createUserWithEmailAndPassword(email, pass);
  return userCredential.user;
}

export async function signOutUser() {
  await auth().signOut();
}

export async function deleteAccountWithPassword(password: string) {
  const user = auth().currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user found.');
  }
  const credential = auth.EmailAuthProvider.credential(user.email, password);
  await user.reauthenticateWithCredential(credential);
  await clearCloudData(user.uid);
  await user.delete();
}

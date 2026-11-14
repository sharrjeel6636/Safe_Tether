import * as authModule from '@react-native-firebase/auth';
import { clearCloudData } from './remote';

const auth = (authModule as any).default || authModule;

export function isFirebaseConfigured(): boolean {
  try {
    const instance = auth();
    return !!instance;
  } catch (error) {
    return false;
  }
}

export async function signInWithEmail(email: string, pass: string) {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, pass);
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
}

export async function signUpWithEmail(email: string, pass: string) {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, pass);
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
}

export async function signOutUser() {
  try {
    await auth().signOut();
  } catch (error: any) {
    throw error;
  }
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

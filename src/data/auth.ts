import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from '@react-native-firebase/auth';
import { clearCloudData } from './remote';

export function isFirebaseConfigured(): boolean {
  try {
    return !!getAuth();
  } catch {
    return false;
  }
}

function logAuthError(where: string, e: any) {
  console.log(`AUTH ERROR [${where}]:`, e?.code, e?.message);
}

export function getAuthErrorMessage(e: any): string {
  switch (e?.code) {
    case 'auth/invalid-email':
      return 'Email address is not valid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak (use at least 6 characters).';
    case 'auth/network-request-failed':
      return 'No internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase.';
    case 'auth/internal-error':
      return 'Firebase internal error. Check SHA-1/SHA-256 and google-services.json.';
    default:
      return `Authentication error: ${e?.code ?? e?.message ?? 'unknown'}`;
  }
}

export async function signInWithEmail(email: string, pass: string) {
  try {
    const cred = await signInWithEmailAndPassword(getAuth(), email.trim(), pass);
    return cred.user;
  } catch (e) {
    logAuthError('signIn', e);
    throw e;
  }
}

export async function signUpWithEmail(email: string, pass: string) {
  try {
    const cred = await createUserWithEmailAndPassword(getAuth(), email.trim(), pass);
    return cred.user;
  } catch (e) {
    logAuthError('signUp', e);
    throw e;
  }
}

export async function signOutUser() {
  await signOut(getAuth());
}

export async function deleteAccountWithPassword(password: string) {
  const user = getAuth().currentUser;
  if (!user || !user.email) {
    throw new Error('No authenticated user found.');
  }
  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await clearCloudData(user.uid);
    await deleteUser(user);
  } catch (e) {
    logAuthError('deleteAccount', e);
    throw e;
  }
}
// src/data/authMessages.ts
// Kept free of Firebase imports so it can be unit-tested.

/** A message a parent can understand. Accepts codes with or without the "auth/" prefix. */
export function friendlyAuthError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  switch (code.replace(/^auth\//, '')) {
    case 'invalid-email':
      return 'That email address does not look right.';
    case 'user-disabled':
      return 'This account has been disabled.';
    case 'user-not-found':
    case 'wrong-password':
    case 'invalid-credential':
      return 'Email or password is incorrect.';
    case 'email-already-in-use':
      return 'An account with this email already exists. Try logging in.';
    case 'weak-password':
      return 'Use a password of at least 6 characters.';
    case 'network-request-failed':
      return 'No internet connection. Please try again.';
    case 'too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'requires-recent-login':
      return 'Please enter your password again to continue.';
  }
  if (error instanceof Error && error.message.includes('No Firebase App')) {
    return 'Firebase is not set up in this build yet (google-services.json is missing).';
  }
  return 'Something went wrong. Please try again.';
}

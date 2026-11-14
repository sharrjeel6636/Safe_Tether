export function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address is badly formatted.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'There is no user record corresponding to this identifier.';
    case 'auth/wrong-password':
      return 'The password is invalid or the user does not have a password.';
    case 'auth/email-already-in-use':
      return 'The email address is already in use by another account.';
    case 'auth/weak-password':
      return 'The password must be 6 characters long or more.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please log in again.';
    default:
      return 'An authentication error occurred. Please try again.';
  }
}

import { describe, it, expect } from '@jest/globals';
import { getAuthErrorMessage } from '../src/data/auth';

describe('Auth Error Messages', () => {
  it('should return correct message for invalid-email', () => {
    expect(getAuthErrorMessage({ code: 'auth/invalid-email' })).toBe('Email address is not valid.');
    expect(getAuthErrorMessage({ code: 'invalid-email' })).toBe('Email address is not valid.');
  });

  it('should return correct message for user-not-found, wrong-password, invalid-credential', () => {
    expect(getAuthErrorMessage({ code: 'auth/user-not-found' })).toBe('Email or password is incorrect.');
    expect(getAuthErrorMessage({ code: 'auth/wrong-password' })).toBe('Email or password is incorrect.');
    expect(getAuthErrorMessage({ code: 'auth/invalid-credential' })).toBe('Email or password is incorrect.');
  });

  it('should return correct message for email-already-in-use', () => {
    expect(getAuthErrorMessage({ code: 'auth/email-already-in-use' })).toBe('An account with this email already exists.');
  });

  it('should return correct message for weak-password', () => {
    expect(getAuthErrorMessage({ code: 'auth/weak-password' })).toBe('Password is too weak (use at least 6 characters).');
  });

  it('should return correct message for network-request-failed', () => {
    expect(getAuthErrorMessage({ code: 'auth/network-request-failed' })).toBe('No internet connection.');
  });

  it('should return correct message for too-many-requests', () => {
    expect(getAuthErrorMessage({ code: 'auth/too-many-requests' })).toBe('Too many attempts. Try again later.');
  });

  it('should return correct message for operation-not-allowed', () => {
    expect(getAuthErrorMessage({ code: 'auth/operation-not-allowed' })).toBe('Email/Password sign-in is not enabled in Firebase.');
  });

  it('should return correct message for internal-error mentioning SHA-1/SHA-256 and google-services.json', () => {
    const msg = getAuthErrorMessage({ code: 'auth/internal-error' });
    expect(msg.toLowerCase()).toContain('check sha-1/sha-256 and google-services.json');
  });

  it('should return Authentication error: code for unknown error codes', () => {
    expect(getAuthErrorMessage({ code: 'auth/unknown-custom-code' })).toBe('Authentication error: auth/unknown-custom-code');
  });
});

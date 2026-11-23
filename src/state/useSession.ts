// src/state/useSession.ts
import { create } from 'zustand';
import { watchAuth } from '../data/auth';
import type { AuthUser } from '../data/auth';

interface SessionState {
  user: AuthUser | null;
  /** The first answer from Firebase Auth has arrived. */
  ready: boolean;
  init(): () => void;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  ready: false,
  init: () => watchAuth((user) => set({ user, ready: true })),
}));

// src/services/emitter.ts
// A tiny typed event emitter. React Native has no Node `events` module, and one small class
// is easier to read (and to fake in tests) than a dependency.

export type Unsubscribe = () => void;

export class Emitter<T> {
  private readonly listeners = new Set<(value: T) => void>();

  on(listener: (value: T) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(value: T): void {
    // Copy first: a listener may unsubscribe while we are iterating.
    for (const l of [...this.listeners]) {
      try {
        l(value);
      } catch (e) {
        // One broken listener must not stop the others (for example a screen that just unmounted).
        console.warn('[Emitter] listener failed', e);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

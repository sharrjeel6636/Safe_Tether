/* eslint-disable react-hooks/purity */
// src/state/useNow.ts
import { useEffect, useState } from 'react';

/** Re-renders every `ms` milliseconds so "last seen 12 s ago" keeps counting. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

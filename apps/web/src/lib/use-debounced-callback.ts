"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Delays a callback until calls stop for `delay` ms. `flush` runs the pending
 * call immediately, for the moment a drag ends.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const latest = useRef(callback);
  const timer = useRef<number | undefined>(undefined);
  const pending = useRef<Args | undefined>(undefined);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    const args = pending.current;
    pending.current = undefined;
    if (args) latest.current(...args);
  }, []);

  const call = useCallback(
    (...args: Args) => {
      pending.current = args;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, delay);
    },
    [delay, flush],
  );

  return { call, flush };
}

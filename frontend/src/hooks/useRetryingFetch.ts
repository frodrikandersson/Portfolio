import { useCallback, useEffect, useRef, useState } from 'react';

// The API is on a free tier that spins down after 15 minutes of inactivity and
// takes ~30s to wake, so the first request after a quiet spell can fail outright.
// Retrying across that window keeps a sleeping backend from looking like empty
// data to the first visitor of the day.
const RETRY_DELAYS_MS = [2000, 5000, 10000, 20000];

/**
 * Fetches once on mount and retries across the backend's wake-up window, staying
 * in the loading state between attempts so the UI can keep saying "still trying"
 * instead of rendering an empty list.
 *
 * `fetcher` must be stable across renders — define it outside the component.
 *
 * `setData`, `setLoading` and `setError` are exposed for callers that also mutate
 * the resource (creating, updating, deleting) and need to reflect that locally.
 */
export function useRetryingFetch<T>(fetcher: () => Promise<T>, initialData: T, fallbackMessage: string) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchToken, setFetchToken] = useState(0);
  const attemptRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    setLoading(true);
    fetcher()
      .then(result => {
        if (cancelled) return;
        attemptRef.current = 0;
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const delay = RETRY_DELAYS_MS[attemptRef.current];
        if (delay !== undefined) {
          attemptRef.current += 1;
          retryTimer = setTimeout(() => setFetchToken(token => token + 1), delay);
          return;
        }
        setError(err instanceof Error ? err.message : fallbackMessage);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [fetcher, fallbackMessage, fetchToken]);

  const retry = useCallback(() => {
    attemptRef.current = 0;
    setError(null);
    setFetchToken(token => token + 1);
  }, []);

  return { data, setData, loading, setLoading, error, setError, retry };
}

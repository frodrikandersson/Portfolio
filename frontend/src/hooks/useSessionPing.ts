import { useEffect } from 'react';

export const useSessionPing = (pingUrl: string, intervalMs = 60000, onInvalidSession?: () => void) => {
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(pingUrl, {
          credentials: 'include',
        });

        if (response.status === 401) {
          if (onInvalidSession) onInvalidSession();
        }
      } catch {
        // silently ignore fetch errors (network offline, etc.)
      }
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [pingUrl, intervalMs, onInvalidSession]);
};

import { useEffect } from 'react';
import { getToken } from '../services/authService';

export const useSessionPing = (pingUrl: string, intervalMs = 5000) => {
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const token = getToken();
      if (!token) return;

      try {
        await fetch(pingUrl, {
          headers: { Authorization: token },
        });
      } catch {
        // silently ignore fetch errors
      }
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [pingUrl, intervalMs]);
};
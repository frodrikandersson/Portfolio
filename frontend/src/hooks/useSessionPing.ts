import { useEffect } from 'react';
import { getToken, removeToken } from '../services/authService';

export const useSessionPing = (pingUrl: string, intervalMs = 5000, onInvalidSession?: () => void) => {
  useEffect(() => {
    const intervalId = setInterval(async () => {
      const token = getToken();
      if (!token) return;
      try {
        const response = await fetch(pingUrl, {
          headers: { Authorization: token },
        });

        if (response.status === 401) {
          removeToken();
          console.warn('Session token is invalid. Removed from storage.');
          if (onInvalidSession) onInvalidSession();
        }
      } catch {
        // silently ignore fetch errors
      }
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [pingUrl, intervalMs]);
};
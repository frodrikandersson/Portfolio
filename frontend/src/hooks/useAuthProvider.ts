// hooks/useAuthProvider.ts
import { useState, useCallback, useEffect } from 'react';
import { getToken } from '../services/authService';
import { handleLogoutUser, handleGetCurrentUserInfo } from './handleUsers';

export const useAuthProvider = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
  const [role, setRole] = useState<string | null>(null);
  const [subscriptionLevel, setSubscriptionLevel] = useState<string | null>(null);

  const resetAuthState = useCallback(() => {
    setIsLoggedIn(false);
    setRole(null);
    setSubscriptionLevel(null);
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const data = await handleGetCurrentUserInfo();
      setRole(data.role);
      setSubscriptionLevel(data.subscriptionLevel);
      setIsLoggedIn(true);
    } catch (err: any) {
      console.error('Failed to fetch user info:', err.message);
      if (err.message === 'Unauthorized' || err.message === 'Session expired') {
        await handleLogoutUser();
        resetAuthState();
      }
      throw err;
    }
  }, [resetAuthState]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserInfo().catch(() => {});
    }
  }, [fetchUserInfo, isLoggedIn]);

  const logoutUser = useCallback(async () => {
    await handleLogoutUser();
    resetAuthState();
  }, [resetAuthState]);

  return {
    isLoggedIn,
    role,
    subscriptionLevel,
    logoutUser,
    setLoggedIn: (val: boolean) => setIsLoggedIn(val),
    fetchUserInfo,
  };
};

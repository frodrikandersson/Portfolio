import { useState, useCallback, useEffect, useMemo } from 'react';
import { privateGetCurrentUser, publicLogoutUser } from '../services/usersService';

export const useAuthProvider = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [subscriptionLevel, setSubscriptionLevel] = useState<string | null>(null);

  const resetAuthState = useCallback(() => {
    setIsLoggedIn(false);
    setRole(null);
    setSubscriptionLevel(null);
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const data = await privateGetCurrentUser();
      setRole(data.role);
      setSubscriptionLevel(data.subscriptionLevel);
      setIsLoggedIn(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message === 'Unauthorized' || message === 'Not authenticated') {
        resetAuthState();
      }
      throw err;
    }
  }, [resetAuthState]);

  // On mount, check if a session cookie is valid
  useEffect(() => {
    fetchUserInfo().catch(() => {});
  }, [fetchUserInfo]);

  // When isLoggedIn changes to true (after login), refresh user info
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserInfo().catch(() => {});
    }
  }, [fetchUserInfo, isLoggedIn]);

  const logoutUser = useCallback(async () => {
    await publicLogoutUser();
    resetAuthState();
  }, [resetAuthState]);

  const setLoggedIn = useCallback((val: boolean) => setIsLoggedIn(val), []);

  return useMemo(() => ({
    isLoggedIn,
    role,
    subscriptionLevel,
    logoutUser,
    setLoggedIn,
    fetchUserInfo,
  }), [isLoggedIn, role, subscriptionLevel, logoutUser, setLoggedIn, fetchUserInfo]);
};

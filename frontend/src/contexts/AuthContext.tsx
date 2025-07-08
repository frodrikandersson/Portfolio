import { createContext, useContext, type ReactNode } from 'react';
import { useSessionPing } from '../hooks/useSessionPing';
import { useAuthProvider } from '../hooks/useAuthProvider';
import type { AuthContextType } from '../models/Auth';

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  role: null,
  subscriptionLevel: null,
  logoutUser: () => {},
  setLoggedIn: () => {},
  fetchUserInfo: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuthProvider();

  useSessionPing(`${import.meta.env.VITE_API_URL}/users/private/me`, 5000, () => {
    auth.setLoggedIn(false);   // 💡 This will trigger the useEffect and clear auth
  });
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

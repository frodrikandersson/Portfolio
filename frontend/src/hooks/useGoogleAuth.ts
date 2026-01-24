import { loginWithGoogle } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const useGoogleAuth = () => {
  const { setLoggedIn } = useAuth();

  const handleGoogleLogin = async (idToken: string) => {
    await loginWithGoogle(idToken);
    setLoggedIn(true);
  };

  return { handleGoogleLogin };
};

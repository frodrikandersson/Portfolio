import { loginWithGoogle  } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

export const handleAuth = () => {
  const { setLoggedIn } = useAuth();

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const data = await loginWithGoogle (idToken);

      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
        setLoggedIn(true);
      } else {
        throw new Error('No session token returned');
      }
    } catch (err) {
      console.error('Google login error:', err);
      throw err;
    }
  };

  return { handleGoogleLogin };
};

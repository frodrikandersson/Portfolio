import { useState } from 'react';
import classes from './LoginForm.module.css';
import { GoogleLogin } from '@react-oauth/google';
import { useAsync } from '../../hooks/useAsync';
import { publicLoginUser } from '../../services/usersService';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setLoggedIn } = useAuth();
  const { handleGoogleLogin } = useGoogleAuth();

  const { execute: loginUser, loading, error, data } = useAsync(publicLoginUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginUser(email, password);
    if (result) {
      setLoggedIn(true);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h2>Welcome Back</h2>
        <p>Sign in to access your library and purchases.</p>
      </div>

      <form className={classes.form} onSubmit={handleSubmit}>
        <div className={classes.field}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className={classes.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
        </div>

        <button className={classes.submitButton} type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className={classes.divider}>or</div>

      <div className={classes.googleLogin}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const idToken = credentialResponse.credential;
            if (!idToken) return;
            try {
              await handleGoogleLogin(idToken);
            } catch {
              // Error handled by handleAuth
            }
          }}
          onError={() => {}}
        />
      </div>

      {error && <p className={classes.error}>{error}</p>}
      {data && <p className={classes.success}>Login successful!</p>}
    </div>
  );
};

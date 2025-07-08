import React, { useState } from 'react';
import classes from './LoginForm.module.css';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAsync } from '../../hooks/useAsync';
import { handleLoginUser } from '../../hooks/handleUsers';
import { useAuth } from '../../contexts/AuthContext';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setLoggedIn } = useAuth();

  const { execute: loginUser, loading, error, data } = useAsync(handleLoginUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginUser(email, password);
    if (result?.sessionToken) {
      setLoggedIn(true); 
    }
  };

  return (
    <>
      <form className={classes.loginForm} onSubmit={handleSubmit}>
        <h2>Login</h2>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className={classes.buttonRegister} type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <GoogleLogin 
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse)
          console.log(jwtDecode(credentialResponse.credential as string));
        }} 
        onError={() => console.log("Login failed")} />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && <p style={{ color: 'green' }}>Login successful!</p>}
    </>
  );
};

import React, { useState } from 'react';
import classes from './RegisterForm.module.css';
import { useAsync } from '../../hooks/useAsync';
import { handleRegisterUser } from '../../hooks/handleUsers';

declare const google: any;

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { execute: registerUser, loading, error, data } = useAsync(handleRegisterUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerUser(email, password);
    console.log("RegisterForm", result)
    if (result) {
      setEmail('');
      setUsername('');
      setPassword('');
    }
  };

  return (
    <>
      <form className={classes.registerForm} onSubmit={handleSubmit}>
        <h2>Register</h2>

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <button className={classes.buttonRegister} type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && <p style={{ color: 'green' }}>Registration successful!</p>}
      </form>
    </>
  );
};

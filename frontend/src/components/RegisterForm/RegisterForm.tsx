import { useState } from 'react';
import classes from './RegisterForm.module.css';
import { useAsync } from '../../hooks/useAsync';
import { publicRegisterUser } from '../../services/usersService';

export const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { execute: registerUser, loading, error, data } = useAsync(publicRegisterUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await registerUser(email, password);
    if (result) {
      setEmail('');
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h2>Create an Account</h2>
        <p>Sign up to purchase products and access your library.</p>
      </div>

      <form className={classes.form} onSubmit={handleSubmit}>
        <div className={classes.field}>
          <label htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your username"
            required
            disabled={loading}
          />
        </div>

        <div className={classes.field}>
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>

        <div className={classes.field}>
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            required
            disabled={loading}
          />
        </div>

        <button className={classes.submitButton} type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {error && <p className={classes.error}>{error}</p>}
      {data && <p className={classes.success}>Registration successful! You can now log in.</p>}
    </div>
  );
};

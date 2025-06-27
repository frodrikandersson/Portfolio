import React, { useState } from 'react';
import classes from './RegisterForm.module.css';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Hook into auth service
    console.log('Registering:', { username, email, password });
  };

  return (
    <form className={classes.registerForm} onSubmit={handleSubmit}>
      <h2>Register</h2>
      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <button className={classes.buttonRegister} type="submit">Register</button>
    </form>
  );
};

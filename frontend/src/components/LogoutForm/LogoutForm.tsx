import React from 'react';
import classes from './LogoutForm.module.css';
import { useAuth } from '../../contexts/AuthContext';

export const LogoutForm: React.FC = () => {
  const { logoutUser, setLoggedIn } = useAuth();

  const handleLogout = () => {
    logoutUser();       // remove token
    setLoggedIn(false); // update context
  };

  return (
    <div className={classes.loginForm}>
      <p>You are logged in.</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};

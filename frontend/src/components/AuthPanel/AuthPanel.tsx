
import React from 'react';
import { LoginForm } from '../LoginForm/LoginForm';
import { LogoutForm } from '../LogoutForm/LogoutForm';
import { useAuth } from '../../contexts/AuthContext';

export const AuthPanel: React.FC = () => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <LogoutForm /> : <LoginForm />;
};

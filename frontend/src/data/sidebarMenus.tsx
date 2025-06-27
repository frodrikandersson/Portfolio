// src/data/sidebarMenus.tsx
import React from 'react';
import { LoginForm } from '../components/LoginForm/LoginForm';
import { RegisterForm } from '../components/RegisterForm/RegisterForm';

export const sidebarMenus: {
  [key: string]: { id: string; title: string; content: React.ReactNode; label: string }[];
} = {
  profile: [
    { id: 'login', title: 'Login.tsx', content: <LoginForm />, label: 'Log in' },
    { id: 'register', title: 'Register.tsx', content: <RegisterForm />, label: 'Register' },
    { id: 'profile-page', title: 'Profile.tsx', content: <div>Profile Page</div>, label: 'Profile page' },
  ],
  search: [
    { id: 'search-tab', title: 'Search.tsx', content: <div>Search UI</div>, label: 'Search' },
  ],
  explorer: [
    { id: 'explorer-tab', title: 'Explorer.tsx', content: <div>Explorer UI</div>, label: 'Explorer' },
  ],
};

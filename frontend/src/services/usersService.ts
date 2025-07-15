import { getToken } from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const publicGetAllUsers = async () => {
  const res = await fetch(`${API_URL}/users/public/`);
  const data = await res.json();
  return data;
};

export const publicLoginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/users/public/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  const token = data.sessionToken;
  if (token) {
    localStorage.setItem('sessionToken', token);
  }

  return data;
};

export const publicLogoutUser = async () => {
  const token = getToken();
  if (!token) return;

  await fetch(`${API_URL}/users/public/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionToken: token }),
  });

  localStorage.removeItem('sessionToken');
};

export const publicRegisterUser = async (email: string, password: string) => {

  const res = await fetch(`${API_URL}/users/public/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.err || 'Registration failed');
  }

  return data;
};

export const privateGetOneUserById = async (id: string) => {
  const token = getToken();
  if (!token) {
    throw new Error('Missing token');
  }

  const res = await fetch(`${API_URL}/users/private/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': token,
    },
  });

  const data = await res.json();
  return data;
};

export const privateGetCurrentUser = async () => {
  const token = getToken();
  if (!token) {
    throw new Error('No token found');
  }

  const res = await fetch(`${API_URL}/users/private/me`, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  });

  const data = await res.json();
  return data;
};


export const privateUpdateUser = async (formData: { firstName: string; lastName: string; picture: string }) => {
  const res = await fetch(`${API_URL}/users/private/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${localStorage.getItem('sessionToken') || ''}`,
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    throw new Error('Failed to update user');
  }

  return res.json(); 
};

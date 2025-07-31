// services/consentService.ts
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const privateGetUserConsent = async (userId: string) => {
  const token = getToken();
  if (!token) throw new Error('Missing token');

  const res = await fetch(`${API_URL}/consents/private/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user consent');
  }

  return await res.json();
};

export const privateRegisterOrUpdateConsent = async (formData: {
  userId: string;
  analytics: boolean;
  marketing: boolean;
  dataSharing: boolean;
}) => {
  const token = getToken();
  if (!token) throw new Error('Missing token');

  const res = await fetch(`${API_URL}/consents/private/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || data?.err || 'Failed to submit consent');
  }

  return data;
};

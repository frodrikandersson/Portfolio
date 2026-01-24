import { apiFetch } from './api';
import type { ConsentChoices } from '../models/consentsInterface';

export const privateGetUserConsent = async (userId: string) => {
  return apiFetch<ConsentChoices | null>(`/consents/private/${userId}`);
};

export const privateRegisterOrUpdateConsent = async (formData: ConsentChoices) => {
  return apiFetch('/consents/private/register', {
    method: 'POST',
    body: formData,
  });
};

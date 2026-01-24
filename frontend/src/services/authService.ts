import { apiFetch } from './api';

export const loginWithGoogle = async (idToken: string): Promise<{ message: string }> => {
  return apiFetch('/auth/public/google-login', {
    method: 'POST',
    body: { idToken },
  });
};

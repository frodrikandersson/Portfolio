import { apiFetch } from './api';

export const getDataFromSession = async (sessionToken: string) => {
  return apiFetch(`/sessions/${sessionToken}`);
};

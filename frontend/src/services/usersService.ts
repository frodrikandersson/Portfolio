import { apiFetch, API_URL } from './api';
import type { IUser } from '../models/usersInterface';
import type { CoverImageData } from '../models/ProductInterface';

export interface ICurrentUser extends IUser {
  role: string;
  subscriptionLevel: string | null;
}

export const publicGetAllUsers = async () => {
  return apiFetch<IUser[]>('/users/public/');
};

export const publicLoginUser = async (email: string, password: string) => {
  return apiFetch<{ message: string }>('/users/public/login', {
    method: 'POST',
    body: { email, password },
  });
};

export const publicLogoutUser = async () => {
  await fetch(`${API_URL}/users/public/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};

export const publicRegisterUser = async (email: string, password: string) => {
  return apiFetch<{ message: string }>('/users/public/register', {
    method: 'POST',
    body: { email, password },
  });
};

export const privateGetOneUserById = async (id: string) => {
  return apiFetch<IUser>(`/users/private/${id}`);
};

export const privateGetCurrentUser = async () => {
  return apiFetch<ICurrentUser>(`/users/private/me`);
};

export const privateUpdateUser = async (formData: { firstName: string; lastName: string }) => {
  return apiFetch<IUser>('/users/private/update', {
    method: 'PATCH',
    body: formData,
  });
};

export const privateUploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiFetch<{ picture: CoverImageData }>('/users/private/avatar', {
    method: 'POST',
    body: formData,
  });
};

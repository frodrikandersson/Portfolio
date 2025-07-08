import {
  publicGetAllUsers,
  publicRegisterUser,
  publicLoginUser,
  publicLogoutUser,
  privateGetOneUserById,
  privateGetCurrentUser,
} from '../services/usersService';

export const handleGetAllUsers = async () => {
  try {
    const data = await publicGetAllUsers();
    console.log('Fetched users:', data);
    return data;
  } catch (err: any) {
    console.error('Error fetching users:', err.message);
    return null;
  }
};

export const handleLoginUser = async (email: string, password: string) => {
  try {
    const data = await publicLoginUser(email, password);
    console.log('Logged in user:', data);
    return data;
  } catch (err: any) {
    console.error('Error logging in:', err.message);
    throw err;
  }
};

export const handleLogoutUser = async () => {
  try {
    await publicLogoutUser();
    console.log('Logged out user');
  } catch (err: any) {
    console.error('Error logging out:', err.message);
  }
};

export const handleRegisterUser = async (email: string, password: string) => {
  try {
    const data = await publicRegisterUser(email, password);
    console.log('Registered user:', data);
    return data;
  } catch (err: any) {
    console.error('Error registering user:', err.message);
    throw err;
  }
};

export const handleGetOneUserById = async (id: string) => {
  try {
    const data = await privateGetOneUserById(id);
    console.log('Fetched user:', data);
    return data;
  } catch (err: any) {
    console.error('Error fetching user:', err.message);
    return null;
  }
};

export const handleGetCurrentUserInfo = async () => {
  try {
    const data = await privateGetCurrentUser();
    console.log('Fetched current user info:', data);
    return data;
  } catch (err: any) {
    console.error('Error fetching current user info:', err.message);
    throw err;
  }
};
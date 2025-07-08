export const getToken = () => localStorage.getItem('sessionToken');

export const removeToken = () => localStorage.removeItem('sessionToken');
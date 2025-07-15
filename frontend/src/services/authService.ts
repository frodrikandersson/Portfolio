export const getToken = () => localStorage.getItem('sessionToken');

export const removeToken = () => localStorage.removeItem('sessionToken');

export const loginWithGoogle = async (idToken: string): Promise<{ sessionToken?: string }> => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/public/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Google login failed');
  }

  return await res.json(); 
};

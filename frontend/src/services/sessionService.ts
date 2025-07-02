import { getToken } from "./authService";

export const getDataFromSession = async () => {
    const token = getToken();
    if (!token) {
        throw new Error('You must be logged in to manage your subscription.');
    }

    const res = await fetch(`http://localhost:4000/sessions/${token}`);
    return res.json();
};
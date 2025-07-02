import { getDataFromSession } from '../services/sessionService';

export const handleGetDataFromSession = async () => {
    try {
        const data = await getDataFromSession();
        return data.userId.toString();
    } catch(err) {
        console.error("Error fetching session data: ", err);
        return null;
    }
};
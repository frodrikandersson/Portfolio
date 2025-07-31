// handlers/handleConsent.ts
import {
  privateGetUserConsent,
  privateRegisterOrUpdateConsent,
} from '../services/consentsService';

export const handleGetUserConsent = async (userId: string) => {
  try {
    const data = await privateGetUserConsent(userId);
    console.log('Fetched user consent:', data);
    return data;
  } catch (err: any) {
    console.error('Error fetching user consent:', err.message);
    return null;
  }
};

export const handleRegisterOrUpdateConsent = async (formData: {
  userId: string;
  analytics: boolean;
  marketing: boolean;
  dataSharing: boolean;
}) => {
  try {
    const data = await privateRegisterOrUpdateConsent(formData);
    console.log('Consent registered/updated:', data);
    return data;
  } catch (err: any) {
    console.error('Error registering/updating consent:', err.message);
    throw err;
  }
};

import { useEffect, useState } from 'react';
import {
  privateGetUserConsent,
  privateRegisterOrUpdateConsent,
} from '../services/consentsService';
import type { ConsentChoices } from '../models/consentsInterface';

export const useUserConsent = (userId: string) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [choices, setChoices] = useState<ConsentChoices>({
    analytics: false,
    marketing: false,
    dataSharing: false,
  });

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const consent = await privateGetUserConsent(userId);
        if (!consent) {
          setVisible(true);
        } else {
          setChoices({
            analytics: consent.analytics ?? false,
            marketing: consent.marketing ?? false,
            dataSharing: consent.dataSharing ?? false,
          });
        }
      } catch {
        setVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConsent();
  }, [userId]);

  const handleAcceptAll = async () => {
    try {
      await privateRegisterOrUpdateConsent({
        analytics: true,
        marketing: true,
        dataSharing: true,
      });
      setVisible(false);
    } catch {
      // Consent submission failed
    }
  };

  const handleSavePreferences = async () => {
    try {
      await privateRegisterOrUpdateConsent(choices);
      setVisible(false);
    } catch {
      // Consent submission failed
    }
  };

  return { visible, loading, choices, setChoices, handleAcceptAll, handleSavePreferences };
};

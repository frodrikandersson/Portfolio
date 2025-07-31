import React, { useEffect, useState } from 'react';
import classes from './ConsentModal.module.css';
import {
  handleGetUserConsent,
  handleRegisterOrUpdateConsent,
} from '../../hooks/handleConsents';
import type { ConsentChoices, ConsentModalProps } from '../../models/consentsInterface';

export const ConsentModal: React.FC<ConsentModalProps> = ({ userId }) => {
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
        const consent = await handleGetUserConsent(userId);
        if (!consent) {
          setVisible(true);
        } else {
          setChoices({
            analytics: consent.analytics ?? false,
            marketing: consent.marketing ?? false,
            dataSharing: consent.dataSharing ?? false,
          });
        }
      } catch (err) {
        console.error('Failed to fetch user consent');
        setVisible(true);
      } finally {
        setLoading(false);
      }
    };

    fetchConsent();
  }, [userId]);

  const handleAcceptAll = async () => {
    try {
      await handleRegisterOrUpdateConsent({
        userId,
        analytics: true,
        marketing: true,
        dataSharing: true,
      });
      setVisible(false);
    } catch (err) {
      console.error('Failed to accept all consent');
    }
  };

  const handleSavePreferences = async () => {
    try {
      await handleRegisterOrUpdateConsent({
        userId,
        ...choices,
      });
      setVisible(false);
    } catch (err) {
      console.error('Failed to save consent preferences');
    }
  };

  if (loading || !visible) return null;

  return (
    <div className={classes.modal}>
      <h2>We value your privacy</h2>
      <p>
        We collect certain personal data such as your name, email address, Google ID, and purchase history to provide our services and improve your experience.
      </p>
      <p>
        We use cookies for analytics, marketing, and to understand how our platform is used. You can choose which types of data processing you're comfortable with.
      </p>

      <div className={classes.options}>
        <label>
          <input
            type="checkbox"
            checked={choices.analytics}
            onChange={(e) => setChoices({ ...choices, analytics: e.target.checked })}
          />
          Allow Analytics (to improve site performance)
        </label>

        <label>
          <input
            type="checkbox"
            checked={choices.marketing}
            onChange={(e) => setChoices({ ...choices, marketing: e.target.checked })}
          />
          Allow Marketing & Personalized Ads
        </label>

        <label>
          <input
            type="checkbox"
            checked={choices.dataSharing}
            onChange={(e) => setChoices({ ...choices, dataSharing: e.target.checked })}
          />
          Allow sharing data with third parties (e.g., payment & analytics providers)
        </label>
      </div>

      <div className={classes.actions}>
        <button onClick={handleAcceptAll}>Accept All</button>
        <button onClick={handleSavePreferences}>Save Preferences</button>
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
          Read our Privacy Policy
        </a>
        <p className={classes.notice}>
          You can update your preferences or request data deletion at any time in your account settings.
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { useUserConsent } from '../../hooks/useUserConsent';
import type { ConsentModalProps } from '../../models/consentsInterface';
import classes from './ConsentModal.module.css';

export const ConsentModal: React.FC<ConsentModalProps> = ({ userId }) => {
  const { visible, loading, choices, setChoices, handleAcceptAll, handleSavePreferences } = useUserConsent(userId);

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

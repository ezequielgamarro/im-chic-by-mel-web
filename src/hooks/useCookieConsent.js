import React, { useState, useEffect } from 'react';

/**
 * Hook para manejar consentimiento de cookies
 * Guarda preferencia en localStorage: 'accepted' | 'rejected' | null
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cookie_consent');
    if (saved) {
      setConsent(saved);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const accept = (category = 'all') => {
    localStorage.setItem('cookie_consent', 'accepted');
    setConsent('accepted');
    setShowBanner(false);
    setShowSettings(false);
  };

  const reject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setConsent('rejected');
    setShowBanner(false);
    setShowSettings(false);
  };

  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);

  const savePreferences = (prefs) => {
    localStorage.setItem('cookie_consent', 'custom');
    localStorage.setItem('cookie_preferences', JSON.stringify(prefs));
    setConsent('custom');
    setShowBanner(false);
    setShowSettings(false);
  };

  return {
    consent,
    showBanner,
    showSettings,
    accept,
    reject,
    openSettings,
    closeSettings,
    savePreferences,
    hasConsented: consent === 'accepted' || consent === 'custom',
    hasRejected: consent === 'rejected',
  };
}

export default useCookieConsent;
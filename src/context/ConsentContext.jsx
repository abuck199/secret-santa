import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'wishly:consent';

// Tracks consent for optional (analytics) cookies. 'accepted' | 'declined' | null.
// Default is null (undecided) -> nothing non-essential loads = privacy by default.
const ConsentContext = createContext({ consent: null, accept: () => {}, decline: () => {} });

function read() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch (_) {
    return null;
  }
}

export function ConsentProvider({ children }) {
  const [consent, setConsent] = useState(read);

  const set = useCallback((value) => {
    setConsent(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }, []);

  const value = useMemo(
    () => ({ consent, accept: () => set('accepted'), decline: () => set('declined') }),
    [consent, set]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  return useContext(ConsentContext);
}

export default ConsentContext;

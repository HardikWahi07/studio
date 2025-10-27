
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context data
interface SettingsContextType {
  language: string;
  setLanguage: (language: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

// Create the context with a default undefined value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create the provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');

  const value = { language, setLanguage, currency, setCurrency };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Create a custom hook to use the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

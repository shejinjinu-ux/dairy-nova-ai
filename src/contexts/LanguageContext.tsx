import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, TranslationDictionary, LANGUAGE_OPTIONS } from '../i18n/translations';
import { getStoredItem, setStoredItem } from '../services/api/apiHelper';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  hasCompletedLanguageOnboarding: boolean;
  t: TranslationDictionary;
  languageOptions: typeof LANGUAGE_OPTIONS;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return getStoredItem<Language>('language_pref', 'en');
  });

  const [hasCompletedLanguageOnboarding, setHasCompletedLanguageOnboarding] = useState<boolean>(() => {
    return getStoredItem<boolean>('has_language_pref', false);
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredItem('language_pref', lang);
    setStoredItem('has_language_pref', true);
    setHasCompletedLanguageOnboarding(true);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    hasCompletedLanguageOnboarding,
    t: { ...TRANSLATIONS.en, ...(TRANSLATIONS[language] || {}) },
    languageOptions: LANGUAGE_OPTIONS,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

import { useCallback, useState } from 'react';

import { SPLASH_LANGUAGES, SPLASH_TRANSLATIONS } from './splashTranslations';

const STORAGE_KEY = 'splash-language';

/**
 * Resolves the initial splash page language: the value persisted in
 * localStorage (if valid), otherwise the browser language when it is one of
 * the supported languages, otherwise English. Safe to call during
 * server-side rendering (returns 'en' when `window` is undefined).
 */
export const getInitialSplashLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SPLASH_LANGUAGES.some((language) => language.code === stored)) {
      return stored;
    }
  } catch (error) {
    // localStorage unavailable (private mode, etc.) — fall through to the browser language.
  }
  const browserLanguage = window.navigator?.language?.toLowerCase()?.split(/[-_]/)[0];
  return SPLASH_LANGUAGES.some((language) => language.code === browserLanguage)
    ? browserLanguage
    : 'en';
};

/**
 * Language state + translation function for the splash page.
 * Returns the selected language code, a setter that persists the choice, and
 * a `t(text)` helper that translates English source strings via
 * SPLASH_TRANSLATIONS, falling back to the original text.
 */
export const useSplashTranslation = () => {
  const [language, setLanguageState] = useState(getInitialSplashLanguage);

  const setLanguage = useCallback((code) => {
    setLanguageState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch (error) {
      // Ignore storage failures; the in-memory language still updates.
    }
  }, []);

  const t = useCallback((text) => SPLASH_TRANSLATIONS[text]?.[language] || text, [language]);

  return { language, setLanguage, t };
};

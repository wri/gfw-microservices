import { useState, useEffect } from 'react';
import { getManualTranslation } from '../utils/manualTranslations';

declare global {
  interface Window {
    Transifex?: {
      live: {
        translateText: (text: string) => string;
        onAfterTranslate: (callback: () => void) => void;
        off?: (event: string, callback: () => void) => void;
        getSelectedLanguageCode?: () => string;
      };
    };
  }
}

export function useTransifexTranslation(text) {
  const [translatedText, setTranslatedText] = useState(text);

  const updateTranslation = () => {
    const translated = window.Transifex?.live?.translateText?.(text);
    if (translated && translated !== text) {
      setTranslatedText(translated);
    } else {
      const languageCode = window.Transifex?.live?.getSelectedLanguageCode?.() || 'en';
      setTranslatedText(getManualTranslation(text, languageCode));
    }
  };

  useEffect(() => {
    if (!window.Transifex?.live) {
      return;
    }

    updateTranslation();

    const handleTranslationUpdate = () => updateTranslation();

    window.Transifex.live.onAfterTranslate(handleTranslationUpdate);

    return () => {
      window.Transifex?.live.off?.('onAfterTranslate', handleTranslationUpdate);
    };
  }, [text]);

  return translatedText;
}

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Transifex?: {
      live: {
        translateText: (text: string) => string;
        onAfterTranslate: (callback: () => void) => void;
        off?: (event: string, callback: () => void) => void;
      };
    };
  }
}

export function useTransifexTranslation(text) {
  const [translatedText, setTranslatedText] = useState(text);

  const updateTranslation = () => {
    const translated = window.Transifex?.live?.translateText?.(text);
    if (translated) {
      setTranslatedText(translated);
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

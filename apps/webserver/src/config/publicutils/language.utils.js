import { defaultLanguageID } from '../langResources';

export const getTransifexLanguageCode = () => {
  return new Promise((resolve) => {
    if (Transifex) {
      Transifex.live.onReady(() => {
        const languageCode = Transifex.live.getSelectedLanguageCode();
        resolve(languageCode);
      });
    } else {
      resolve(defaultLanguageID);
    }
  });
};

export const getLanguageNameAbbreviation = (languageCode) => {
  let languageNameAbbreviation = languageCode;
  switch (languageCode) {
    case 'en':
      languageNameAbbreviation = 'EN';
      break;
    case 'pt_BR':
      languageNameAbbreviation = 'PT';
      break;
    case 'es_MX':
      languageNameAbbreviation = 'ES';
      break;
    default:
      // For undefined/null/empty codes (e.g. English as Transifex source language), show 'EN'.
      languageNameAbbreviation = languageCode || 'EN';
      break;
  }
  return languageNameAbbreviation;
};

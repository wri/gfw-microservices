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
      break;
  }
  return languageNameAbbreviation;
};

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'EN' },
  { label: 'Spanish', value: 'ES' },
  { label: 'Portuguese', value: 'PT' },
];

export const SPANISH_LANGUAGE_COUNTRIES = new Set([
  'andorra',
  'argentina',
  'bolivia',
  'chile',
  'colombia',
  'costa rica',
  'cuba',
  'dominican republic',
  'ecuador',
  'el salvador',
  'equatorial guinea',
  'guatemala',
  'honduras',
  'mexico',
  'nicaragua',
  'panama',
  'paraguay',
  'peru',
  'spain',
  'uruguay',
  'vatican city',
  'venezuela',
]);

export const PORTUGUESE_LANGUAGE_COUNTRIES = new Set([
  'angola',
  'brazil',
  'cabo verde',
  'guinea-bissau',
  'guinea bissau',
  'mozambique',
  'portugal',
  'sao tome and principe',
  'timor-leste',
  'timor leste',
]);

export const normalizeCountryToken = (value = '') => String(value).trim().toLowerCase();

export const getDefaultLanguageForCountry = (country = '') => {
  const normalizedCountry = normalizeCountryToken(country);

  if (PORTUGUESE_LANGUAGE_COUNTRIES.has(normalizedCountry)) {
    return 'PT';
  }

  if (SPANISH_LANGUAGE_COUNTRIES.has(normalizedCountry)) {
    return 'ES';
  }

  return 'EN';
};

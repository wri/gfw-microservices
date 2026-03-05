export const columnHeaders = {
  alertsInNaturalForest: 'Alerts in Natural Forest',
  alertsInNonForest: 'Alerts in Non-Forest',
  alertsInJrc: 'Alerts in JRC Forest',
  allAlerts: 'All Alerts',
  alternativeMill: 'Alternative Mill Name',
  certification: 'Certification',
  certified: 'Certified',
  commodity: 'Commodity',
  company: 'Company',
  criticalHabitatProxy: 'Critical Habitat Proxy',
  deforestation: 'Deforestation',
  designation: 'Designation',
  designationType: 'Designation Type',
  fire: 'Fire',
  fires: 'Fires',
  forest: 'Forest',
  high: 'High',
  id: 'ID',
  indigenousPeoples: 'Indigenous Peoples',
  iucn: 'IUCN Category',
  locationName: 'Location',
  low: 'Low',
  mediumAbbr: 'Med',
  medium: 'Medium',
  millPriority: 'Mill Priority',
  naturalHabitatProxies: 'Natural Habitat Proxies',
  no: 'No',
  overallThreats: 'Overall Threats',
  overallValues: 'Overall Values',
  parentCompany: 'Parent Company',
  peat: 'Peat',
  policyCategories: 'Policy Categories',
  primaryForest: 'Primary Forest',
  protectedAreas: 'Protected Areas',
  rspo: 'RSPO Certified',
  rspoModel: 'RSPO Model',
  siteId: 'Site ID',
  size: 'Size',
  sizeInHa: 'Size (ha)',
  state: 'State',
  supplier: 'Supplier',
  supplierTwo: 'Supplier 2',
  threats: 'Threats',
  threatsAndValuesAbbr: 'T + V',
  threatsAndValues: 'Threats and Values',
  treeCoverExtent: 'Tree Cover',
  treeCoverExtentInHa: 'Tree Cover Extent in ha',
  treeCoverLoss: 'Tree Cover Loss',
  treeCoverLossInHa: 'Tree Cover Loss, all years in ha',
  treeCoverLossOnPrimaryForest: 'Loss on Primary Forest',
  treeCover: 'Tree Cover',
  total: 'Total',
  values: 'Values',
  yes: 'Yes',
};

// Manual translations for column headers not discovered by Transifex
// These are used as fallbacks when Transifex.live.translateText returns the original string
export const columnHeaderTranslations = {
  'Alerts in Natural Forest': {
    es: 'Alertas en el Bosque Natural',
    pt: 'Alertas em Floresta Natural',
  },
  'Alerts in Non-Forest': {
    es: 'Alertas en zonas no forestales',
    pt: 'Alertas em Áreas Não Florestais',
  },
  'Alerts in JRC Forest': {
    es: 'Alertas en el Bosque JRC',
    pt: 'Alertas na Floresta JRC',
  },
  'All Alerts': {
    es: 'Todas las alertas',
    pt: 'Todos os Alertas',
  },
};

// Helper function to get manual translation with fallback
export const getManualTranslation = (text, languageCode) => {
  const translations = columnHeaderTranslations[text];
  if (!translations) {
    return text;
  }

  // Normalize language code - handle various formats like 'pt', 'pt-BR', 'pt_BR', 'pt-br'
  const normalizedCode = languageCode?.toLowerCase()?.split(/[-_]/)[0];

  if (normalizedCode === 'es') {
    return translations.es || text;
  }
  if (normalizedCode === 'pt') {
    return translations.pt || text;
  }

  return text;
};

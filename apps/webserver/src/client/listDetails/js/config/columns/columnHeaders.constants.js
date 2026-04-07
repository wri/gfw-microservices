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
  'since last TCL data update': {
    es: 'desde la última actualización de datos TCL',
    pt: 'desde a última atualização de dados TCL',
  },
  'Recent Disturbance Alerts': {
    es: 'Alertas de Perturbación Reciente',
    pt: 'Alertas de Perturbação Recente',
  },
  'Download Report': {
    es: 'Descargar Informe',
    pt: 'Baixar Relatório',
  },
  'Analysis updated': {
    es: 'Análisis actualizado',
    pt: 'Análise atualizada',
  },
  'Land Cover Dataset': {
    es: 'Conjunto de datos de cobertura terrestre',
    pt: 'Conjunto de dados de cobertura terrestre',
  },
  'JRC Global Forest Cover': {
    es: 'Cobertura forestal global JRC',
    pt: 'Cobertura florestal global JRC',
  },
  'SBTN Natural Lands': {
    es: 'Tierras naturales de SBTN',
    pt: 'Terras naturais SBTN',
  },
  'Forest Dataset': {
    es: 'Conjunto de datos forestal',
    pt: 'Conjunto de dados florestais',
  },
  'SBTN Natural Forest Loss': {
    es: 'Pérdida de bosque natural SBTN',
    pt: 'Perda de floresta natural SBTN',
  },
  'Post-2000 Forest Change': {
    es: 'Cambio Forestal Posterior al año 2000',
    pt: 'Mudança Florestal Pós-2000',
  },
  'List Map': {
    es: 'Mapa de lista',
    pt: 'Mapa da lista',
  },
  'Update Analysis': {
    es: 'Actualizar análisis',
    pt: 'Atualizar análise',
  },
  'List diagnostic': {
    es: 'Diagnóstico de lista',
    pt: 'Diagnóstico da lista',
  },
  'Location Diagnostic': {
    es: 'Diagnóstico de ubicación',
    pt: 'Diagnóstico de localização',
  },
  'Location diagnostic': {
    es: 'Diagnóstico de ubicación',
    pt: 'Diagnóstico de localização',
  },
  'New data available': {
    es: 'Nuevos datos disponibles',
    pt: 'Novos dados disponíveis',
  },
  'Updated analysis data is available. Re-submit your list for analysis to see the latest results.':
    {
      es: 'Hay nuevos datos de análisis disponibles. Vuelva a enviar su lista para análisis y vea los últimos resultados.',
      pt: 'Novos dados de análise estão disponíveis. Reenvie sua lista para análise e veja os resultados mais recentes.',
    },
  'Re-submit': {
    es: 'Reenviar',
    pt: 'Reenviar',
  },
  'Location(s) Map': {
    es: 'Mapa de ubicación(es)',
    pt: 'Mapa de localização(ões)',
  },
  'Copy/Move': {
    es: 'Copiar/Mover',
    pt: 'Copiar/Mover',
  },
  Copy: {
    es: 'Copiar',
    pt: 'Copiar',
  },
  'Location(s) CSV': {
    es: 'CSV de ubicación(es)',
    pt: 'CSV de localização(ões)',
  },
  'Location(s) Shapefile': {
    es: 'Shapefile de ubicación(es)',
    pt: 'Shapefile de localização(ões)',
  },
  'Downloads contain location data only; no analysis': {
    es: 'Las descargas contienen solo datos de ubicación; sin análisis',
    pt: 'Os downloads contêm apenas dados de localização; sem análise',
  },
  'Download error file CSV': {
    es: 'Descargar archivo de error CSV',
    pt: 'Baixar arquivo de erro CSV',
  },
  'Recommended to support EUDR compliance': {
    es: 'Recomendado para cumplir con el EUDR',
    pt: 'Recomendado para conformidade com o EUDR',
  },
  'Deforestation in natural forest since 2021 + additional contextual datasets': {
    es: 'Deforestación en bosque natural desde 2021 + conjuntos de datos contextuales adicionales',
    pt: 'Desmatamento em floresta natural desde 2021 + conjuntos de dados contextuais adicionais',
  },
  'Recent global integrated disturbance alerts for one time analysis.': {
    es: 'Alertas de perturbación global integrada reciente para análisis único.',
    pt: 'Alertas de perturbação global integrada recente para análise única.',
  },
  'Annual tree cover loss since 2001 + additional contextual and regional datasets': {
    es: 'Pérdida anual de cobertura arbórea desde 2001 + conjuntos de datos contextuales y regionales adicionales',
    pt: 'Perda anual de cobertura arbórea desde 2001 + conjuntos de dados contextuais e regionais adicionais',
  },
  'Recent global integrated disturbance alerts, automatically updated weekly.': {
    es: 'Alertas de perturbación global integrada reciente, actualizadas automáticamente de forma semanal.',
    pt: 'Alertas de perturbação global integrada recente, atualizadas automaticamente semanalmente.',
  },
  'Selecting Weekly Alerts will deduct from available usage. Please see our': {
    es: 'Seleccionar Alertas Semanales deducirá del uso disponible. Consulte nuestro',
    pt: 'Selecionar Alertas Semanais irá deduzir do uso disponível. Consulte nossa',
  },
  'Price Sheet': {
    es: 'Hoja de precios',
    pt: 'Tabela de preços',
  },
  'for more information.': {
    es: 'para más información.',
    pt: 'para mais informações.',
  },
  'Submit Analysis': {
    es: 'Enviar análisis',
    pt: 'Enviar análise',
  },
  'Save as Draft': {
    es: 'Guardar como borrador',
    pt: 'Salvar como rascunho',
  },
  "Select which type(s) of data analysis you'd like to be available for this list. Note that analysis processing counts towards your account usage limits. See more information":
    {
      es: 'Seleccione qué tipo(s) de análisis de datos desea tener disponibles para esta lista. Tenga en cuenta que el procesamiento de análisis cuenta para los límites de uso de su cuenta. Ver más información',
      pt: 'Selecione qual(is) tipo(s) de análise de dados você gostaria de disponibilizar para esta lista. O processamento de análise conta para os limites de uso da sua conta. Veja mais informações',
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

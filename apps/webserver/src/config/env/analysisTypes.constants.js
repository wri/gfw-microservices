const analysisTypes = {
  FOREST_CHANGE_DIAGNOSTICS: 'FCD',
  DEFORESTATION_KPIS: 'AFI',
  ALERTS: 'ALERTS',
};

const analysisTypesOptions = [
  {
    id: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
    label: 'Forest Change Global',
    shortLabel: 'Forest Change',
  },
  {
    id: analysisTypes.DEFORESTATION_KPIS,
    label: 'Deforestation Reporting (cutoff date 2020)',
    shortLabel: 'Reporting',
  },
  {
    id: analysisTypes.ALERTS,
    label: 'Near-real time alerts',
    shortLabel: 'Alerts',
  },
];

module.exports = {
  analysisTypes,
  analysisTypesOptions,
};

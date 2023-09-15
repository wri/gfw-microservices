const analysisTypes = {
  FOREST_CHANGE_DIAGNOSTICS: 'FCD',
  DEFORESTATION_KPIS: 'AFI',
};

const analysisTypesLabels = {
  FCD: 'Forest Change Global',
  AFI: 'Deforestation Reporting (cutoff date 2020)',
};

const analysisTypesOptions = [
  {
    id: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
    label: 'Forest Change Global',
  },
  {
    id: analysisTypes.DEFORESTATION_KPIS,
    label: 'Deforestation Reporting (cutoff date 2020)',
  },
];

module.exports = {
  analysisTypes,
  analysisTypesOptions,
  analysisTypesLabels,
};

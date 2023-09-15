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
    label: analysisTypesLabels['FCD'],
  },
  {
    id: analysisTypes.DEFORESTATION_KPIS,
    label: analysisTypesLabels['AFI'],
  },
];

module.exports = {
  analysisTypes,
  analysisTypesOptions,
  analysisTypesLabels,
};

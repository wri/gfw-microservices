const analysisTypes = {
  FOREST_CHANGE_DIAGNOSTICS: 'FCD',
  DEFORESTATION_KPIS: 'AFI',
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

const statusFromWorseToBetter = [
  { code: 4, status: 'Draft' },
  { code: 3, status: 'Inactive' },
  { code: 1, status: 'Pending' },
  { code: 5, status: 'Analyzing Diagnostic' },
  { code: 6, status: 'Analyzing Dashboard' },
  { code: 2, status: 'Active' },
];

module.exports = {
  analysisTypes,
  analysisTypesOptions,
  statusFromWorseToBetter,
};

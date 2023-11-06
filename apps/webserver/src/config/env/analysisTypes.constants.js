/**
 * This file has same contents as libs/constants/src/lib/analysisTypes.constants.ts
 * This file is intended for frontend client code, while
 * libs/constants/src/lib/analysisTypes.constants.ts is intended for the backend
 * Test in apps/webserver/src/config/env/analysisTypes.constants.spec.js verifies the contents
 * of the two files are identical
 */

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
    label: 'Near-real time alerts (GLAD, VIIRS)',
    shortLabel: 'Alerts',
  },
];

module.exports = {
  analysisTypes,
  analysisTypesOptions,
};

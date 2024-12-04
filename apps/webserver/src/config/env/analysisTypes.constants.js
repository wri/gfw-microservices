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
    id: analysisTypes.DEFORESTATION_KPIS,
    label: 'Post-2020 Risk Assessment',
    shortLabel: 'Reporting',
    description: 'Deforestation in natural forest since 2021 + additional contextual datasets',
  },
  {
    id: analysisTypes.ALERTS,
    label: 'Recent Deforestation Alerts',
    shortLabel: 'Alerts',
    description: 'Recent deforestation alerts, updated weekly',
  },
  {
    id: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
    label: 'Post-2000 Forest Change',
    shortLabel: 'Forest Change',
    description: 'Annual tree cover loss since 2001 + additional contextual and regional datasets',
  },
];

module.exports = {
  analysisTypes,
  analysisTypesOptions,
};

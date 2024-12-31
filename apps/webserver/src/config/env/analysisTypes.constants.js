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

// remove these constant names when isListDetailsPageRedesignAvailable feature flag is removed
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
    label: 'NEAR-REAL TIME ALERTS (INTEGRATED ALERTS, VIIRS)',
    shortLabel: 'Alerts',
  },
];

const analysisTypesOptionsNewNames = [
  {
    id: analysisTypes.DEFORESTATION_KPIS,
    label: 'Post-2020 Risk Assessment',
    shortLabel: 'Post-2020',
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
    shortLabel: 'Post-2000',
    description: 'Annual tree cover loss since 2001 + additional contextual and regional datasets',
  },
];

module.exports = {
  analysisTypes,
  analysisTypesOptions,
  analysisTypesOptionsNewNames,
};

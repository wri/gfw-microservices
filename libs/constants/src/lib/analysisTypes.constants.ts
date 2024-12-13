/**
 * This file has same contents as apps/webserver/src/config/env/analysisTypes.constants.js
 * This file is intended for all backend services (webserver and microservices) to use, while
 * apps/webserver/src/config/env/analysisTypes.constants.js is intended for the client
 * Test in apps/webserver/src/config/env/analysisTypes.constants.spec.js verifies the contents
 * of the two files are identical
 */

export const analysisTypes = {
  FOREST_CHANGE_DIAGNOSTICS: 'FCD',
  DEFORESTATION_KPIS: 'AFI',
  ALERTS: 'ALERTS',
};

// update these constant names when isListDetailsPageRedesignAvailable feature flag is removed
export const analysisTypesOptions = [
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

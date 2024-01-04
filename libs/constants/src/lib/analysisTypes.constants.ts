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

export const analysisTypesOptions = [
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

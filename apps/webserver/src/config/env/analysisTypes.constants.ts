/**
 * This file has same contents as libs/constants/src/lib/analysisTypes.constants.ts
 * This file is intended for frontend client code, while
 * libs/constants/src/lib/analysisTypes.constants.ts is intended for the backend
 * Test in apps/webserver/src/config/env/analysisTypes.constants.spec.js verifies the contents
 * of the two files are identical
 */

export const analysisTypes = {
  FOREST_CHANGE_DIAGNOSTICS: 'FCD',
  DEFORESTATION_KPIS: 'AFI',
  ALERTS: 'ALERTS',
  GREENHOUSE_GAS_EMISSIONS: 'GHG',
  PALM_RISK: 'PalmRisk',
} as const;

export const analysisTypesOptionsNewNames = [
  {
    id: analysisTypes.DEFORESTATION_KPIS,
    label: 'Post-2020 Risk Assessment',
    shortLabel: 'Post-2020',
    description: 'Deforestation in natural forest since 2021 + additional contextual datasets',
    showInUI: true,
  },
  {
    id: analysisTypes.ALERTS,
    label: 'Recent Disturbance Alerts',
    shortLabel: 'Alerts',
    description: 'Recent disturbance alerts, updated weekly',
    showInUI: true,
  },
  {
    id: analysisTypes.FOREST_CHANGE_DIAGNOSTICS,
    label: 'Post-2000 Forest Change',
    shortLabel: 'Post-2000',
    description: 'Annual tree cover loss since 2001 + additional contextual and regional datasets',
    showInUI: true,
  },
  {
    id: analysisTypes.GREENHOUSE_GAS_EMISSIONS,
    label: 'Greenhouse Gas Emissions',
    shortLabel: 'GHG',
    description: 'Greenhouse gas emissions from deforestation and forest degradation',
    showInUI: false,
  },
];

export const analysisTypesForUI = analysisTypesOptionsNewNames.filter((option) => option.showInUI);

export const palmRiskAnalysis = {
  id: analysisTypes.PALM_RISK,
  label: 'Include Palm Risk Assessment',
  shortLabel: '',
  description: 'Commodity-specific risk analysis for palm oil mills',
};

/**
 * This file has same contents as apps/webserver/src/config/env/analysisTypes.constants.js
 * This file is intended for all backend services (webserver and microservices) to use, while
 * apps/webserver/src/config/env/analysisTypes.constants.js is intended for the client
 * Test in apps/webserver/src/config/env/analysisTypes.constants.spec.js verifies the contents
 * of the two files are identical
 */
export enum ListAnalysisIds {
  FCD = 'FCD',
  AFI = 'AFI',
  ALERTS = 'ALERTS',
  GHG = 'GHG',
}

export const analysisTypes = {
  FOREST_CHANGE_DIAGNOSTICS: 'FCD',
  DEFORESTATION_KPIS: 'AFI',
  ALERTS: 'ALERTS',
  GREENHOUSE_GAS_EMISSIONS: 'GHG',
  PALM_RISK: 'PalmRisk',
};

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
    label: 'Recent Deforestation Alerts',
    shortLabel: 'Alerts',
    description: 'Recent deforestation alerts, updated weekly',
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

export const analysisIdsOptionsMap = {
  [ListAnalysisIds.FCD]: ['PalmRisk'],
};

export const GADM_FEATURE_FLAG_NAME = 'gadm41';
export const CURRENT_GADM_VALUE = '3.6';
export const NEW_GADM_VALUE = '4.1';

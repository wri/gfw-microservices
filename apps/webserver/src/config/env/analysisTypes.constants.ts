/**
 * Frontend bridge for analysis constants.
 * Canonical values live in libs/constants and are re-exported here to keep
 * existing client imports stable while using a single source of truth.
 */

export { analysisTypes, analysisTypesOptionsNewNames } from '@wri-monorepos/constants';

import {
  analysisTypes,
  analysisTypesOptionsNewNames,
  AlertsAnalysisFrequency as SharedAlertsAnalysisFrequency,
  analysisIdsOptionsMap as sharedAnalysisIdsOptionsMap,
} from '@wri-monorepos/constants';

export const analysisTypesForUI = analysisTypesOptionsNewNames.filter((option) => option.showInUI);

export const palmRiskAnalysis = {
  id: analysisTypes.PALM_RISK,
  label: 'Include Palm Risk Assessment',
  shortLabel: '',
  description: 'Commodity-specific risk analysis for palm oil mills',
};

export const AlertsAnalysisFrequency = SharedAlertsAnalysisFrequency;

export const analysisIdsOptionsMap = sharedAnalysisIdsOptionsMap;

export const weeklyAlertsAnalysis = {
  id: AlertsAnalysisFrequency.WEEKLY,
  label: 'Weekly Alerts',
  shortLabel: AlertsAnalysisFrequency.WEEKLY,
  description: 'Recent global integrated disturbance alerts, automatically updated weekly.',
};

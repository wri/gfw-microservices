import {
  analysisTypes,
  analysisTypesForUI,
  palmRiskAnalysis,
  weeklyAlertsAnalysis,
} from '../../../../../../config/env/analysisTypes.constants';

export const VALID_UPLOAD_FILE_FORMATS = [
  'csv',
  'xls',
  'xlsx',
  'zip',
  'kml',
  'kmz',
  'geojson',
  'json',
];
export const VALID_FILE_FORMATS_BY_ID = ['csv', 'xls', 'xlsx'];

export const typeOfAnalysisMap = analysisTypesForUI.flatMap<{
  id: string;
  label: string;
  description: string;
}>((option) => {
  if (option.id === analysisTypes.ALERTS) {
    return [option, weeklyAlertsAnalysis];
  }
  if (option.id === analysisTypes.FOREST_CHANGE_DIAGNOSTICS) {
    return [option, palmRiskAnalysis];
  }
  return [option];
});

export const commodities = {
  cattle: 'Cattle',
  cocoa: 'Cocoa',
  coffee: 'Coffee',
  'palm-oil': 'Palm oil',
  'pulp-and-paper': 'Pulp and paper',
  rubber: 'Rubber',
  soy: 'Soy',
  'sugar-cane': 'Sugar cane',
  multiple: 'Multiple',
  other: 'Other',
} as const;

export const customCommodities = ['Cattle', 'Pulp and paper', 'Multiple'];

import {
  analysisTypesForUI,
  palmRiskAnalysis,
} from '../../../../../../config/env/analysisTypes.constants';

export const VALID_UPLOAD_FILE_FORMATS = ['csv', 'xls', 'xlsx', 'zip', 'kml', 'kmz', 'geojson'];

export const typeOfAnalysisMap = [...analysisTypesForUI, palmRiskAnalysis];

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

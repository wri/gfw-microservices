import { analysisTypesOptionsNewNames } from '../../../../../../config/env/analysisTypes.constants';

export const VALID_UPLOAD_FILE_FORMATS = ['csv', 'xls', 'xlsx', 'zip', 'kml', 'kmz'];

export const typeOfAnalysisMap = [
  ...analysisTypesOptionsNewNames.slice(0, 1),
  ...analysisTypesOptionsNewNames.slice(2, 3),
  {
    id: 'palmRiskAssessment',
    label: 'Include Palm Risk Assessment',
    shortLabel: '',
    description: 'Commodity-specific risk analysis for palm oil mills',
  },
  ...analysisTypesOptionsNewNames.slice(1, 2),
];

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
};

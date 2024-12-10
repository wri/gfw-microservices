export const VALID_UPLOAD_FILE_FORMATS = ['csv', 'xls', 'xlsx', 'zip', 'kml', 'kmz'];

export const typeOfAnalysisMap: {
  id:
    | 'recentDeforestationAlerts'
    | 'post2000ForestChange'
    | 'includePalmRiskAssessment'
    | 'post2000RiskAssessment';
  title: string;
  body: string;
}[] = [
  {
    id: 'post2000ForestChange',
    title: 'Post-2000 Forest Change',
    body: 'Post-2000 annual tree cover loss + additional contextual and regional datasets',
  },
  {
    id: 'includePalmRiskAssessment',
    title: 'Include Palm Risk Assessment',
    body: 'Commodity-specific risk analysis for palm oil mills',
  },
  {
    id: 'recentDeforestationAlerts',
    title: 'Recent Deforestation Alerts',
    body: 'Recent deforestation alerts, updated weekly',
  },
  {
    id: 'post2000RiskAssessment',
    title: 'Post-2020 Risk Assessment',
    body: 'Post-2020 deforestation in natural forest + additional contextual datasets',
  },
];

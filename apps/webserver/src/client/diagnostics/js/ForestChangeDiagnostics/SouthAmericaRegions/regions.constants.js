export const regionIds = {
  ARGENTINA: 'argentina',
  REGIONAL: 'regional',
};

export const regionsTabs = [
  {
    id: regionIds.REGIONAL,
    label: 'Regional',
  },
  {
    id: regionIds.ARGENTINA,
    label: 'Argentina',
  },
];

export const chartDatasetConfigs = {
  argentinaOtbn: {
    id: 'otbnArgentina',
    chartsSelectorTitle: 'Tree Cover Loss on Argentina OTBN',
    dataCy: 'tree-cover-loss-OTBN',
    legendColor: 'rgb(255,127,179)',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
    downloadId: 'southAmericaTCL',
    diagnosticTitle: 'OTBN Percent Overlap',
    chartLabels: [
      { id: 'Category I', color: 'rgb(238,37,33)', legend: 'Category I' },
      { id: 'Category II', color: 'rgb(255,204,51)', legend: 'Category II' },
      { id: 'Category III', color: 'rgb(151,189,61)', legend: 'Category III' },
    ],
    startYear: 2008,
    endYear: 2022,
  },
  wdpaOverlapCountry: {
    diagnosticTitle: 'Protected Areas Percent Overlap',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
    downloadUrl: 'listId=5692&country=Argentina&category=WDPA',
    chartLabels: [
      { id: 'fullyRestrictive', color: '#862e13', legend: 'Fully Restricted' },
      { id: 'lessRestricted', color: '#eb5027', legend: 'Less Restricted' },
    ],
  },
  landmarkOverlapCountry: {
    diagnosticTitle: 'Indigenous Terriotories Percent Overlap',
    downloadUrl: 'listId=5692&country=Argentina&category=landmark',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
    chartLabels: [
      { id: 'indigenous', color: '#a8704a', legend: 'Overlap with Indigenous Territories' },
      { id: 'nonIndegenous', color: '#deaf82', legend: 'Non-Overlap with Indigenous Territories' },
    ],
  },
};

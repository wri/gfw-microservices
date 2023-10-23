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
  argentinaCompliance: {
    id: 'otbnArgentina',
    label: 'Tree Cover Loss on Argentina OTBN',
    dataCy: 'tree-cover-loss-OTBN',
    legendColor: 'rgb(255,127,179)',
    informationBubbleId: 'tree_cover_loss_arg_otbn_yearly',
    downloadId: 'southAmericaTCL',
    categories: [
      { id: 'otbnArgentinaCategoryI', name: 'Category I', color: 'rgb(238,37,33)' },
      { id: 'otbnArgentinaCategoryII', name: 'Category II', color: 'rgb(255,204,51)' },
      { id: 'otbnArgentinaCategoryIII', name: 'Category III', color: 'rgb(151,189,61)' },
    ],
    startYear: 2008,
    endYear: 2022,
  },
};

export const timeframeOptions = [
  {
    label: 'Day',
    value: 'DAY',
    category: ['VIIRS'],
  },
  {
    label: 'Week',
    value: 'WEEK',
    category: ['GLAD', 'VIIRS'],
  },
  {
    label: 'Month',
    value: 'MONTH',
    category: ['GLAD'],
  },
  {
    label: 'Quarter',
    value: 'QUARTER',
    category: ['GLAD'],
  },
  {
    label: 'Year',
    value: 'YEAR',
    category: ['GLAD'],
  },
];

export const alertsShownOptions = [
  {
    value: 'GLAD',
    label: 'Deforestation (Integrated Alerts)',
  },
  {
    value: 'VIIRS',
    label: 'Fires (VIIRS)',
  },
];

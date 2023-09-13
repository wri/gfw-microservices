import _range from 'lodash/range';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_YEAR_FOR_LODASH_RANGE = CURRENT_YEAR + 1;

export const PRODES_HIGHCHARTS_BAR_CONFIGS = [
  {
    years: [2001, 2002, 2003, 2004, 2005, 2006, 2007],
    label: 'Cerrado only',
    color: '#9ECC49',
    type: 'PRODES',
  },
  {
    years: _range(2009, CURRENT_YEAR_FOR_LODASH_RANGE, 2),
    // years: [2009, 2011, 2013, 2015, 2017, 2019],
    label: 'Amazônia and Cerrado',
    color: '#641b98',
    type: 'PRODES',
  },
  {
    years: _range(2008, CURRENT_YEAR_FOR_LODASH_RANGE, 2),
    // years: [2008, 2010, 2012, 2014, 2016, 2018],
    label: 'Amazônia only',
    color: '#136400',
    type: 'PRODES',
  },
];

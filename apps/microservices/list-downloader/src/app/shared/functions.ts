import { ListFieldsFileRequest } from '@wri-monorepos/sql';

export const cloneRow = (row) => {
  if (Array.isArray(row) === false) {
    return [];
  }
  return [...row];
};

export const formatPct = (value) => {
  if (value === undefined) {
    return undefined;
  } else if (typeof value === 'string') {
    return parseFloat(value).toFixed(2);
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  }
};

// Formats number with commas
export const prettifyNum = (value) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const validatePct = (percentage) => {
  if (percentage > 100) {
    return 100;
  } else if (isNaN(percentage) || !isFinite(percentage) || Math.sign(percentage) === -1) {
    return 0;
  } else {
    return percentage;
  }
};

export const parseListData = (property, listLevelAnalysis) => {
  let total = 0;

  const listAnalysisData = listLevelAnalysis[0];

  if (Object.prototype.hasOwnProperty.call(listAnalysisData ?? {}, property)) {
    const yearlyData = JSON.parse(listAnalysisData[property]);

    if (
      [
        'tree_cover_loss_brazil_biomes_yearly',
        'tree_cover_loss_sea_landcover_yearly',
        'tree_cover_loss_idn_landcover_yearly',
        'tree_cover_loss_idn_legal_yearly',
      ].includes(property)
    ) {
      const biomes = Object.keys(yearlyData ?? {});
      biomes.forEach((biome) => {
        Object.entries(yearlyData[biome]).forEach((entry) => {
          const [, value] = entry;
          const newValue = Number(value || 0);
          total = total + newValue;
        });
      });
    } else if (Array.isArray(yearlyData)) {
      yearlyData.forEach((year) => {
        total += year.result;
      });
    } else if (typeof yearlyData === 'number') {
      total += yearlyData;
    } else {
      Object.keys(yearlyData).forEach((year) => {
        total += yearlyData[year];
      });
    }
    total = Math.round(total * 100) / 100;
  } else {
    total = 0;
  }

  total = Math.round(total * 100) / 100;

  return total;
};

export const parseListTotals = (property, listLevelAnalysis) => {
  let total = Object.prototype.hasOwnProperty.call(listLevelAnalysis ?? {}, property)
    ? listLevelAnalysis[property]
    : 0;
  total = total ?? 0;
  return Math.round(total * 100) / 100;
};

export const isJSON = (text: unknown) => {
  if (typeof text !== 'string') {
    return false;
  }
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    return false;
  }
};

export const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

export const isObjInCountryFormat = (data) => {
  const dataArray = Object.keys(data);
  if (dataArray.length === 0) {
    return false;
  }

  return dataArray.every((x) => x.length === 3);
};

export const getTotalArea = (data, countryGadm) => {
  const countryArea = JSON.parse(data.country_area || '{}');

  return countryArea[countryGadm] ?? 0;
};

export const shouldGenerateArgentinaCsv = ({
  listView,
  type,
  listLevelAnalysis,
}: ListFieldsFileRequest) => {
  const VALID_TYPES = ['argentina', 'everything'];

  const { country_area } = listLevelAnalysis;
  const totalArea = getTotalArea(listLevelAnalysis, 'ARG');
  const isArgentinaDataAvailable = totalArea > 0;
  const isAnalysisLegacy = country_area === null;

  return (
    VALID_TYPES.includes(type) &&
    listView === 'forest_change' &&
    isArgentinaDataAvailable &&
    !isAnalysisLegacy
  );
};

export const shouldGenerateColombiaCsv = ({
  type,
  listView,
  listLevelAnalysis,
}: ListFieldsFileRequest) => {
  const VALID_TYPES = ['colombia', 'everything'];

  const totalArea = getTotalArea(listLevelAnalysis, 'COL');

  return VALID_TYPES.includes(type) && totalArea > 0 && listView === 'forest_change';
};

export const filterYearsByDateRange = (data, startYear: number, endYear: number) => {
  if (startYear > endYear) {
    throw new Error('Start year must be less than or equal to end year');
  }

  for (const category in data) {
    if (data[category]) {
      data[category] = Object.fromEntries(
        Object.entries(data[category]).filter(([year]) => {
          const yearInt = parseInt(year, 10);
          return yearInt >= startYear && yearInt <= endYear;
        })
      );
    }
  }

  return data;
};

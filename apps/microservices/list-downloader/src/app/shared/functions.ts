import { Logger } from '@nestjs/common';

const logger = new Logger('Shared Functions');

const cloneRow = (row) => {
  if (Array.isArray(row) === false) return [];
  return [...row];
};

const formatPct = (value) => {
  if (value === undefined) {
    return undefined;
  } else if (typeof value === 'string') {
    return parseFloat(value).toFixed(2);
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  }
};

// Formats number with commas
const prettifyNum = (value) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const validatePct = (percentage) => {
  if (percentage > 100) {
    return 100;
  } else if (isNaN(percentage) || !isFinite(percentage) || Math.sign(percentage) === -1) {
    return 0;
  } else {
    return percentage;
  }
};

const parseListData = (property, listLevelAnalysis) => {
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

const parseListTotals = (property, listLevelAnalysis) => {
  let total = Object.prototype.hasOwnProperty.call(listLevelAnalysis ?? {}, property)
    ? listLevelAnalysis[property]
    : 0;
  total = total ?? 0;
  return Math.round(total * 100) / 100;
};

const fetchRetry = (url, options = {}, retries = 3, interval = 2000) => {
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then((response) => response.json())
      .then((json) => resolve(json))
      .catch((error) => {
        setTimeout(() => {
          if (retries === 1) {
            // reject('maximum retries exceeded');
            reject(error);
            return;
          }
          // Passing on "reject" is the important part
          logger.log(`Attempt ${retries} for ${url}`);
          fetchRetry(url, options, retries - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

export {
  cloneRow,
  formatPct,
  prettifyNum,
  validatePct,
  parseListData,
  parseListTotals,
  fetchRetry,
};

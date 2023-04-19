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
const prettifyNum = (value) =>
  value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const validatePct = (percentage) => {
  if (percentage > 100) {
    return 100;
  } else if (
    isNaN(percentage) ||
    !isFinite(percentage) ||
    Math.sign(percentage) === -1
  ) {
    return 0;
  } else {
    return percentage;
  }
};

const parseListData = (property, listLevelAnalysis) => {
  let total = 0;

  const listAnalysisData = listLevelAnalysis[0];

  if (listAnalysisData[property]) {
    const yearlyData = JSON.parse(listAnalysisData[property]);

    if (
      [
        'tree_cover_loss_brazil_biomes_yearly',
        'tree_cover_loss_sea_landcover_yearly',
        'tree_cover_loss_idn_landcover_yearly',
        'tree_cover_loss_idn_legal_yearly',
      ].includes(property)
    ) {
      const biomes = Object.keys(yearlyData);
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
  const total = listLevelAnalysis[property];

  return Math.round(total * 100) / 100;
};

export {
  cloneRow,
  formatPct,
  prettifyNum,
  validatePct,
  parseListData,
  parseListTotals,
};

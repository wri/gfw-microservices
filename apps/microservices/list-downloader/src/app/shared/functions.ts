const duplicateRow = (row) => {
  const currentRow = [];
  row.forEach((value) => {
    currentRow.push(value);
  });
  return currentRow;
}


const formatPct = (value) => value.toFixed(2);

// Formats number with commas
const prettifyNum = (value) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const validatePct = (percentage) => {
  if (percentage > 100) {
    return 100;
  } else if (isNaN(percentage) || !isFinite(percentage) || Math.sign(percentage) === -1) {
    return 0;
  } else {
    return percentage;
  }
};

const  parseListData = (property, listLevelAnalysis) => {
  let total = 0;

  const listAnalysisData = listLevelAnalysis[0];

  if (listAnalysisData[property]) {
    const yearlyData = JSON.parse(listAnalysisData[property]);

    if (
      property === 'tree_cover_loss_brazil_biomes_yearly' ||
      property === 'tree_cover_loss_sea_landcover_yearly' ||
      property === 'tree_cover_loss_idn_landcover_yearly' ||
      property === 'tree_cover_loss_idn_legal_yearly'
    ) {
      const biomes = Object.keys(yearlyData);
      biomes.forEach((biome) => {
        Object.entries(yearlyData[biome]).forEach((entry) => {
          const [, value] = entry;
          const newValue = Number (value || 0);
          total = total + newValue;
        });
      });
    } else if (yearlyData.forEach) {
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
}

const parseListTotals = (property, listLevelAnalysis) => {
  const total = listLevelAnalysis[property];

  return Math.round(total * 100) / 100;
};

export {
  duplicateRow,
  formatPct,
  prettifyNum,
  validatePct,
  parseListData,
  parseListTotals
}

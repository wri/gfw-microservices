import _range from 'lodash/range';
import _isEmpty from 'lodash/isEmpty';
import { chartDatasetConfigs } from '../../SouthAmericaRegions/regions.constants';

const getTreeCoverLossArgOtbnYearlyData = (
  data,
  startYear,
  endYear,
  showCategoryI,
  showCategoryII,
  showCategoryIII
) => {
  const showTotal = !showCategoryI && !showCategoryII && !showCategoryIII;

  const treeCoverLossArgOtbnYearly = data?.tree_cover_loss_arg_otbn_yearly
    ? JSON.parse(data?.tree_cover_loss_arg_otbn_yearly)
    : {};

  if (Object.entries(treeCoverLossArgOtbnYearly).length === 0) {
    return {
      chartData: [],
      totalLossByCategory: {
        'Category I': 0,
        'Category II': 0,
        'Category III': 0,
      },
      otbnTotalLoss: 0,
    };
  }

  const filterDataByYearRange = (obj) =>
    Object.entries(obj).filter(([key]) => {
      const currentYear = parseInt(key, 10);
      return currentYear >= startYear && currentYear <= endYear;
    });

  const chartData = [];
  let otbnTotalLoss = 0;
  const totalLossByCategory = {};
  const { argentinaOtbn } = chartDatasetConfigs;
  argentinaOtbn.chartLabels.forEach(({ id, color }) => {
    if (
      (id === 'Category I' && showCategoryI) ||
      (id === 'Category II' && showCategoryII) ||
      (id === 'Category III' && showCategoryIII) ||
      showTotal
    ) {
      let dataFilteredByYearRange;
      const YEARS_RANGE = _range(startYear, endYear + 1);

      const treeCoverLossArgOtbnYearlyForCategory = treeCoverLossArgOtbnYearly[id];
      const treeCoverLossArgOtbnYearlyForCategoryIsEmpty = _isEmpty(
        treeCoverLossArgOtbnYearlyForCategory
      );
      if (treeCoverLossArgOtbnYearlyForCategory && !treeCoverLossArgOtbnYearlyForCategoryIsEmpty) {
        dataFilteredByYearRange = filterDataByYearRange(treeCoverLossArgOtbnYearlyForCategory);
      } else {
        dataFilteredByYearRange = YEARS_RANGE.map((year) => [`${year}`, 0]);
      }

      const categoryLoss = dataFilteredByYearRange
        .map(([, value]) => value)
        .reduce((x, y) => parseFloat(x) + parseFloat(y));
      totalLossByCategory[id] = categoryLoss;
      otbnTotalLoss += categoryLoss;
      chartData.push({
        id,
        data: dataFilteredByYearRange,
        color,
      });
    } else {
      totalLossByCategory[id] = 0;
    }
  });

  return {
    chartData,
    totalLossByCategory,
    otbnTotalLoss,
  };
};

export default getTreeCoverLossArgOtbnYearlyData;

import _range from 'lodash/range';
import _isEmpty from 'lodash/isEmpty';
import { otbnCategories, otbnChartsColors } from '../OtbnChartsColors.constants';

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

  otbnCategories.forEach((category) => {
    if (
      (category === 'Category I' && showCategoryI) ||
      (category === 'Category II' && showCategoryII) ||
      (category === 'Category III' && showCategoryIII) ||
      showTotal
    ) {
      let dataFilteredByYearRange;
      const YEARS_RANGE = _range(startYear, endYear + 1);

      const treeCoverLossArgOtbnYearlyForCategory = treeCoverLossArgOtbnYearly[category];
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
      totalLossByCategory[category] = categoryLoss;
      otbnTotalLoss += categoryLoss;
      chartData.push({
        name: category,
        data: dataFilteredByYearRange,
        color: otbnChartsColors[category],
      });
    } else {
      totalLossByCategory[category] = 0;
    }
  });

  return {
    chartData,
    totalLossByCategory,
    otbnTotalLoss,
  };
};

export default getTreeCoverLossArgOtbnYearlyData;

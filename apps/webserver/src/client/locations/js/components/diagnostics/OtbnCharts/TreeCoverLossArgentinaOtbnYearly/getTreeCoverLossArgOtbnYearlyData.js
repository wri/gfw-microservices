import { otbnChartsColors } from '../OtbnChartsColors.constants';

const getTreeCoverLossArgOtbnYearlyData = (
  data,
  startYear,
  endYear,
  showCategoryI,
  showCategoryII,
  showCategoryIII
) => {
  const showTotal = !showCategoryI && !showCategoryII && !showCategoryIII;
  const categories = ['Category I', 'Category II', 'Category III'];

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
    Object.entries(obj).filter(([key]) => parseInt(key, 10) >= startYear && parseInt(key, 10) <= endYear);

  const chartData = [];
  let otbnTotalLoss = 0;
  const totalLossByCategory = {};

  categories.forEach((category) => {
    const dataFilteredByYearRange = filterDataByYearRange(treeCoverLossArgOtbnYearly[category]);
    const categoryLoss = dataFilteredByYearRange
      .map(([, value]) => value)
      .reduce((x, y) => parseFloat(x) + parseFloat(y));

    if (
      (category === 'Category I' && showCategoryI) ||
      (category === 'Category II' && showCategoryII) ||
      (category === 'Category III' && showCategoryIII) ||
      showTotal
    ) {
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

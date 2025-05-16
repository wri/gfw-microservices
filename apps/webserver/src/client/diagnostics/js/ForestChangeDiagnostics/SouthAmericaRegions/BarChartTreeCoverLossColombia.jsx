import { useState } from 'react';

import { Card, CardContent } from '@mui/material';
import BarChart from '../../common/BarChart';
import { SelectorWithTwoLevels } from './SelectorWithTwoLevels';
import { SelectorWithOneLevel } from './SelectorWithOneLevel';
import { chartDatasetConfigsColombia, regionConstants } from './regions-constants';
import { getBarChartData, getBarChartDataWithTwoLevels } from './getBarChartData';
import { updateCheckedLabelsForChartDatasetConfig } from './barChart.utils';

export function BarChartTreeCoverLossColombia({ rawBarChartData, isAllDataEmpty }) {
  const {
    classifiedRegionTreeCoverLoss,
    protectedAreasTreeCoverLoss,
    indigenousTerritoriesTreeCoverLoss,
  } = chartDatasetConfigsColombia;

  const [categoriesOneLevelBarChart, setCategoriesOneLevelBarChart] = useState([
    protectedAreasTreeCoverLoss,
    indigenousTerritoriesTreeCoverLoss,
  ]);

  const [selectedOptionId, setSelectedOptionId] = useState(classifiedRegionTreeCoverLoss.id);

  const {
    colombia: { startYear, endYear },
  } = regionConstants;
  const dateRange = { startYear, endYear };

  let barChartData = [];

  if (selectedOptionId === classifiedRegionTreeCoverLoss.id) {
    barChartData = getBarChartDataWithTwoLevels(
      rawBarChartData,
      dateRange,
      classifiedRegionTreeCoverLoss
    );
  } else {
    const chartConfiguration = categoriesOneLevelBarChart.find(
      (config) => config.id === selectedOptionId
    );
    barChartData = getBarChartData(rawBarChartData, dateRange, chartConfiguration.chartLabels);
  }

  const handleCheckedLabelsUpdate = (optionId, labelId, isChecked) => {
    setCategoriesOneLevelBarChart((prevOptions) =>
      updateCheckedLabelsForChartDatasetConfig({
        optionId,
        labelId,
        isChecked,
        options: prevOptions,
      })
    );
  };

  return (
    <Card>
      <CardContent>
        <div className="diagnostics-chart-container">
          <div className="diagnostics-chart-container__chart">
            {isAllDataEmpty ? (
              <div>No data available for any chart selection.</div>
            ) : (
              <BarChart
                data={barChartData}
                columnStackStyle="normal"
                yAxisTitleText="Forest Loss (ha)"
                rawBarChartData={rawBarChartData?.classified_region?.tree_cover_loss}
                isDataWithTwoLevelsOfCategory={
                  selectedOptionId === classifiedRegionTreeCoverLoss.id
                }
              />
            )}
          </div>
          <div className="chart-legends-table">
            <table>
              <thead>
                <tr>
                  <th />
                  <th className="label right">Total loss (HA)</th>
                </tr>
              </thead>
              <tbody>
                <SelectorWithTwoLevels
                  data={rawBarChartData}
                  chartConfiguration={classifiedRegionTreeCoverLoss}
                  selectedOptionId={selectedOptionId}
                  onOptionChange={setSelectedOptionId}
                />
                <SelectorWithOneLevel
                  countryPieChartsData={rawBarChartData}
                  selectedOptionId={selectedOptionId}
                  onOptionChange={setSelectedOptionId}
                  chartsConfiguration={categoriesOneLevelBarChart}
                  onCheckedLabelsUpdate={handleCheckedLabelsUpdate}
                  showTotalLoss
                />
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

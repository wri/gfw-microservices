import React, { useState } from 'react';

import { Card, CardContent } from '@mui/material';
import BarChart from '../../common/BarChart';
import { SelectorWithTwoLevels } from './SelectorWithTwoLevels';
import { SelectorWithOneLevel } from './SelectorWithOneLevel';
import InfoIcon from 'material-ui/svg-icons/action/info';
import { chartDatasetConfigsColombia, regionConstants } from './regions.constants';
import { getBarChartData, getBarChartDataWithTwoLevels } from './getBarChartData';

export function BarChartTreeCoverLossColombia({ rawBarChartData, isAllDataEmpty }) {
  const {
    classifiedRegionTreeCoverLoss,
    protectedAreasTreeCoverLoss,
    indigenousTerritoriesTreeCoverLoss,
  } = chartDatasetConfigsColombia;

  const [selectedOptionId, setSelectedOptionId] = useState(classifiedRegionTreeCoverLoss.id);

  const { startYear, endYear } = regionConstants;
  const dateRange = { startYear, endYear };

  const categoriesOneLevelBarChart = [
    protectedAreasTreeCoverLoss,
    indigenousTerritoriesTreeCoverLoss,
  ];

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

  return (
    <Card>
      <h3 style={{ fontStyle: 'italic', paddingLeft: '4rem', marginBottom: 0 }}>
        Select one main category and/or sub-category to adjust the graph and table
      </h3>

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
            {selectedOptionId === classifiedRegionTreeCoverLoss.id && !isAllDataEmpty && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon color="gray" />
                Bars with lower opacity indicate that the year is approximate.
              </div>
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
                  updateCheckedLabels={() => null}
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

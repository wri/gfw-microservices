import React, { useState } from 'react';

import { Card, CardContent } from '@mui/material';
import BarChart from '../../common/BarChart';
import { SelectorWithTwoLevels } from './SelectorWithTwoLevels';
import InfoIcon from 'material-ui/svg-icons/action/info';
import { chartDatasetConfigs, regionConstants } from './regions.constants';
import { getBarChartDataColombia } from './getBarChartData';

const { colombianTreeCoverLoss } = chartDatasetConfigs;

export function BarChartTreeCoverLossColombia({ countryPieChartsData, isAllDataEmpty }) {
  const [selectedOptionId, setSelectedOptionId] = useState(colombianTreeCoverLoss.id);

  const { startYear, endYear } = regionConstants;

  const barChartData = getBarChartDataColombia(
    countryPieChartsData,
    { startYear, endYear },
    colombianTreeCoverLoss
  );

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
              />
            )}
            {selectedOptionId === colombianTreeCoverLoss.id && !isAllDataEmpty && (
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
                  data={countryPieChartsData}
                  chartConfiguration={colombianTreeCoverLoss}
                  selectedOptionId={selectedOptionId}
                  onOptionChange={setSelectedOptionId}
                />
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

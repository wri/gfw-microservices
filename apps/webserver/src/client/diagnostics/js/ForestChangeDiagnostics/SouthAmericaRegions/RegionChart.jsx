import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import DateRangeSilder from './DateRangeSlider';
import BarChart from './BarChart';
import OtbnAreaChart from '../OtbnCharts/OtbnAreaChart';
import ChartsSelector from './ChartsSelector';
import getTreeCoverLossArgOtbnYearlyData from '../OtbnCharts/TreeCoverLossArgentinaOtbnYearly/getTreeCoverLossArgOtbnYearlyData';
import DiagnosticsChartHeader from '../../common/DiagnosticsChartHeader';
import { chartDatasetConfigs } from './regions.constants';
import '../../common/DiagnosticsChartContainer.scss';

function RegionChart({ data, fireDownload }) {
  const { id, label, dataCy, informationBubbleId, downloadId, categories, startYear, endYear } =
    chartDatasetConfigs.argentinaCompliance;

  const checkedCategoriestest = categories.map((category) => ({ ...category, checked: true }));

  const [dateRange, setDateRange] = useState({
    startYear,
    endYear,
  });

  const [checkedCategories, setCheckedCategories] = useState(checkedCategoriestest);

  const { totalLossByCategory, otbnTotalLoss, chartData } = getTreeCoverLossArgOtbnYearlyData(
    data,
    dateRange.startYear,
    dateRange.endYear,
    checkedCategories[0].checked,
    checkedCategories[1].checked,
    checkedCategories[2].checked
  );

  return (
    <>
      <DiagnosticsChartHeader
        title={label}
        informationBubbleId={informationBubbleId}
        fireDownload={fireDownload}
        downloadId={downloadId}
      />
      <Card>
        <CardContent>
          <div className="diagnostics-chart-container">
            <div className="diagnostics-chart-container__chart">
              <BarChart data={chartData} />
            </div>

            <ChartsSelector
              id={id}
              label={label}
              dataCy={dataCy}
              checkedCategories={checkedCategories}
              setCheckedCategories={setCheckedCategories}
              totalLossByCategory={totalLossByCategory}
              totalLoss={otbnTotalLoss}
            />
          </div>
        </CardContent>
      </Card>

      <DateRangeSilder
        id={id}
        dateRange={dateRange}
        setDateRange={setDateRange}
        startYear={startYear}
        endYear={endYear}
      />

      <OtbnAreaChart data={data} />
    </>
  );
}

export default RegionChart;

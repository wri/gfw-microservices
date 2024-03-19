import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import DateRangeSilder from './DateRangeSlider';
import BarChart from '../../common/BarChart';
import PieChart from '../../common/PieChart';
import ChartsSelector from './ChartsSelector';
import getTreeCoverLossArgOtbnYearlyData from '../OtbnCharts/TreeCoverLossArgentinaOtbnYearly/getTreeCoverLossArgOtbnYearlyData';
import DiagnosticsChartHeader from '../../common/DiagnosticsChartHeader';
import { formatDecimals } from '../../../../common/js/utils/diagnostics.utils';
import { chartDatasetConfigs } from './regions.constants';
import '../../common/DiagnosticsChartContainer.scss';

function RegionChart({ listId, data, fireDownload }) {
  const { argentinaOtbn, wdpaOverlapCountry, landmarkOverlapCountry } = chartDatasetConfigs;

  const initialCheckedChartLabels = argentinaOtbn.chartLabels.map((label) => ({
    ...label,
    checked: true,
  }));

  const [dateRange, setDateRange] = useState({
    startYear: argentinaOtbn.startYear,
    endYear: argentinaOtbn.endYear,
  });
  const [checkedChartLabels, setCheckedChartLabels] = useState(initialCheckedChartLabels);
  const [argentinaPieChartsData, setArgentinaPieChartsData] = useState({});
  const { totalLossByCategory, otbnTotalLoss, chartData } = getTreeCoverLossArgOtbnYearlyData(
    data,
    dateRange.startYear,
    dateRange.endYear,
    checkedChartLabels[0].checked,
    checkedChartLabels[1].checked,
    checkedChartLabels[2].checked
  );

  const argentinaOtbnAreaData = formatDecimals(JSON.parse(data?.arg_otbn_area) || {});

  useEffect(() => {
    fetch(`/api/fcd?listId=${listId}&country=Argentina&countryGadm=ARG&category=WDPA,landmark`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Request error');
        }
      })
      .then((data) => {
        if (!data.WDPA?.error || !data.landmark?.error) {
          setArgentinaPieChartsData(data);
        }
      })
      .catch((e) => {
        console.warn(e);
      });
  }, [listId]);

  const WDPA = formatDecimals(argentinaPieChartsData.WDPA);
  const landmark = formatDecimals(argentinaPieChartsData.landmark);

  return (
    <>
      <DiagnosticsChartHeader
        title={argentinaOtbn.chartsSelectorTitle}
        informationBubbleId={argentinaOtbn.informationBubbleId}
        fireDownload={fireDownload}
        downloadId={argentinaOtbn.downloadId}
      />
      <Card>
        <CardContent>
          <div className="diagnostics-chart-container">
            <div className="diagnostics-chart-container__chart">
              <BarChart data={chartData} />
            </div>

            <ChartsSelector
              id={argentinaOtbn.id}
              chartsSelectorTitle={argentinaOtbn.chartsSelectorTitle}
              dataCy={argentinaOtbn.dataCy}
              checkedChartLabels={checkedChartLabels}
              setCheckedChartLabels={setCheckedChartLabels}
              totalLossByCategory={totalLossByCategory}
              totalLoss={otbnTotalLoss}
            />
          </div>
        </CardContent>
      </Card>

      <DateRangeSilder
        id={argentinaOtbn.id}
        dateRange={dateRange}
        setDateRange={setDateRange}
        startYear={argentinaOtbn.startYear}
        endYear={argentinaOtbn.endYear}
      />

      <PieChart
        data={argentinaOtbnAreaData}
        chartLabels={argentinaOtbn.chartLabels}
        title={argentinaOtbn.diagnosticTitle}
        informationBubbleId={argentinaOtbn.informationBubbleId}
      />

      {WDPA?.overlap && (
        <PieChart
          data={WDPA.overlap}
          chartLabels={wdpaOverlapCountry.chartLabels}
          title={wdpaOverlapCountry.diagnosticTitle}
          informationBubbleId={wdpaOverlapCountry.informationBubbleId}
        />
      )}
      {landmark?.overlap && (
        <PieChart
          data={landmark.overlap}
          chartLabels={landmarkOverlapCountry.chartLabels}
          title={landmarkOverlapCountry.diagnosticTitle}
          informationBubbleId={landmarkOverlapCountry.informationBubbleId}
        />
      )}
    </>
  );
}

export default RegionChart;

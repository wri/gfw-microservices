import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import InfoIcon from 'material-ui/svg-icons/action/info';
import CardContent from '@mui/material/CardContent';
import DateRangeSilder from './DateRangeSlider';
import BarChart from '../../common/BarChart';
import PieChart from '../../common/PieChart';
import ChartsSelectorArgentina from './ChartsSelectorArgentina';
import getTreeCoverLossArgOtbnYearlyData from '../OtbnCharts/TreeCoverLossArgentinaOtbnYearly/getTreeCoverLossArgOtbnYearlyData';
import DiagnosticsChartHeader from '../../common/DiagnosticsChartHeader';
import { formatDecimals } from '../../../../common/js/utils/diagnostics.utils';
import { chartDatasetConfigs } from './regions.constants';
import { getBarChartData } from './getBarChartData';
import { useQuery } from '../../../../common/js/hooks';
import '../../common/DiagnosticsChartContainer.scss';

function RegionChartArgentina({ listId, data, fireDownload }) {
  const query = useQuery();
  const locationId = query.get('locationId');
  const {
    argentinaOtbn,
    argentinaTreeCoverLoss,
    protectedAreas,
    wdpaOverlapCountry,
    landmarkOverlapCountry,
  } = chartDatasetConfigs;

  const [chartsConfiguration, setChartsConfiguration] = useState([
    argentinaOtbn,
    argentinaTreeCoverLoss,
    protectedAreas,
  ]);

  const [selectedOptionId, setSelectedOptionId] = useState(chartsConfiguration[0].id);

  const [dateRange, setDateRange] = useState();

  const [argentinaPieChartsData, setArgentinaPieChartsData] = useState({});
  const [otbnBarChartData, setOtbnBarChartData] = useState({});

  const updateLoss = (optionId, totalLossByCategory, otbnTotalLoss) => {
    setChartsConfiguration((prevOptions) => {
      return prevOptions.map((option) => {
        if (option.id === optionId) {
          const updatedChartLabels = option.chartLabels.map((label) => {
            return { ...label, totalLossByCategory: totalLossByCategory[label.id] };
          });
          return { ...option, chartLabels: updatedChartLabels, totalLoss: otbnTotalLoss };
        }
        return option;
      });
    });
  };

  function handleDateRangeChange(newDateRange) {
    setDateRange(newDateRange);

    // Call getTreeCoverLossArgOtbnYearlyData with the new date range
    const {
      totalLossByCategory,
      otbnTotalLoss,
      chartData: newOtbnBarChartData,
    } = getTreeCoverLossArgOtbnYearlyData(
      data,
      newDateRange.startYear,
      newDateRange.endYear,
      chartsConfiguration[0].chartLabels[0].checked,
      chartsConfiguration[0].chartLabels[1].checked,
      chartsConfiguration[0].chartLabels[2].checked
    );

    updateLoss('otbnArgentina', totalLossByCategory, otbnTotalLoss);
    setOtbnBarChartData(newOtbnBarChartData);
  }

  const updateCheckedLabels = (optionId, labelId, isChecked) => {
    setChartsConfiguration((prevOptions) => {
      // Capture the updated state in a separate variable
      const updatedOptions = prevOptions.map((option) => {
        if (option.id === optionId) {
          const updatedChartLabels = option.chartLabels.map((label) => {
            if (label.id === labelId) {
              return { ...label, checked: isChecked };
            }
            return label;
          });
          return { ...option, chartLabels: updatedChartLabels };
        }
        return option;
      });

      // Call getTreeCoverLossArgOtbnYearlyData with the updated chart configuration
      const {
        totalLossByCategory,
        otbnTotalLoss,
        chartData: newOtbnBarChartData,
      } = getTreeCoverLossArgOtbnYearlyData(
        data,
        dateRange.startYear,
        dateRange.endYear,
        updatedOptions[0].chartLabels[0].checked,
        updatedOptions[0].chartLabels[1].checked,
        updatedOptions[0].chartLabels[2].checked
      );

      updateLoss('otbnArgentina', totalLossByCategory, otbnTotalLoss);
      setOtbnBarChartData(newOtbnBarChartData);

      return updatedOptions;
    });
  };

  useEffect(() => {
    handleDateRangeChange({
      startYear: argentinaOtbn.startYear,
      endYear: argentinaOtbn.endYear,
    });
  }, []);

  const argentinaOtbnAreaData = formatDecimals(JSON.parse(data?.arg_otbn_area) || {});

  const fcdParams = {
    listId,
    locationId,
    country: 'Argentina',
    countryGadm: 'ARG',
    category: ['WDPA', 'landmark', 'country', 'classified_region'],
  };

  useEffect(() => {
    fetch(`/api/fcd?${new URLSearchParams(fcdParams).toString()}`, {
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

  let barChartData = [];
  switch (selectedOptionId) {
    case argentinaOtbn.id:
      barChartData = otbnBarChartData;
      break;
    case argentinaTreeCoverLoss.id:
      barChartData = getBarChartData(
        argentinaPieChartsData,
        dateRange,
        chartsConfiguration[1].chartLabels
      );
      break;
    case protectedAreas.id:
      barChartData = getBarChartData(
        argentinaPieChartsData,
        dateRange,
        chartsConfiguration[2].chartLabels
      );
      break;
    default:
      break;
  }

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
              <BarChart data={barChartData} />
              {selectedOptionId === argentinaTreeCoverLoss.id && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon color="gray" />
                  Bars with lower opacity indicate that the year is approximate.
                </div>
              )}
            </div>

            <ChartsSelectorArgentina
              updateCheckedLabels={updateCheckedLabels}
              chartsConfiguration={chartsConfiguration}
              onOptionChange={setSelectedOptionId}
              selectedOptionId={selectedOptionId}
            />
          </div>
        </CardContent>
      </Card>

      <DateRangeSilder
        id={argentinaOtbn.id}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
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

export default RegionChartArgentina;

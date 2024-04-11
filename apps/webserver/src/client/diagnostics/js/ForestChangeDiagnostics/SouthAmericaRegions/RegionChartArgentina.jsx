import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import DateRangeSilder from './DateRangeSlider';
import BarChart from '../../common/BarChart';
import PieChart from '../../common/PieChart';
import ChartsSelectorArgentina from './ChartsSelectorArgentina';
import getTreeCoverLossArgOtbnYearlyData from '../OtbnCharts/TreeCoverLossArgentinaOtbnYearly/getTreeCoverLossArgOtbnYearlyData';
import DiagnosticsChartHeader from '../../common/DiagnosticsChartHeader';
import { formatDecimals } from '../../../../common/js/utils/diagnostics.utils';
import { chartDatasetConfigs } from './regions.constants';
import '../../common/DiagnosticsChartContainer.scss';
import { useQuery } from '../../../../common/js/hooks';

function RegionChartArgentina({ listId, data, fireDownload }) {
  const query = useQuery();
  const locationId = query.get('locationId');
  const { argentinaOtbn, argentinaTreeCoverLoss, wdpaOverlapCountry, landmarkOverlapCountry } =
    chartDatasetConfigs;

  const [chartsConfiguration, setChartsConfiguration] = useState([
    argentinaOtbn,
    argentinaTreeCoverLoss,
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
    // Update the date range
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

    // Update the state with the new data
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

      // Update the state with the new data
      updateLoss('otbnArgentina', totalLossByCategory, otbnTotalLoss);
      setOtbnBarChartData(newOtbnBarChartData);

      // Return the updated options
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

  const filterDataByYearRange = (data, startYear, endYear) => {
    return data.filter((entry) => {
      const year = entry.x; // 'x' represents the year
      return year >= startYear && year <= endYear;
    });
  };

  const hansenTreeCoverLoss = argentinaPieChartsData.country?.data?.tree_cover_loss;

  const filteredHansenTreeCoverLoss = hansenTreeCoverLoss
    ? [
        {
          id: 'hansenTreeCoverLoss',
          data: filterDataByYearRange(
            Object.entries(hansenTreeCoverLoss)?.map(([year, value]) => ({
              x: parseInt(year),
              y: value,
            })),
            dateRange.startYear,
            dateRange.endYear
          ),
          color: 'rgb(238,37,33)',
        },
      ]
    : [];

  const country_specific_deforestation =
    argentinaPieChartsData.country?.data?.country_specific_deforestation;
  const filteredCountrySpecificDeforestation = country_specific_deforestation
    ? [
        {
          id: 'country_specific_deforestation',
          data: filterDataByYearRange(
            Object.entries(country_specific_deforestation)?.map(([year, value]) => {
              // Check if the key ends with "approx"
              const isApprox = year.endsWith('approx');
              // Determine color based on the condition
              const color = isApprox ? 'pink' : 'blue';
              // Remove "approx" from the year for display
              const displayYear = isApprox ? year.slice(0, -6) : year;
              return {
                x: parseInt(displayYear),
                y: value,
                color,
              };
            }),
            dateRange.startYear,
            dateRange.endYear
          ),
        },
      ]
    : [];

  const WDPA = formatDecimals(argentinaPieChartsData.WDPA);
  const landmark = formatDecimals(argentinaPieChartsData.landmark);

  const treeCoverLossBarChartData = chartsConfiguration[1].chartLabels
    .filter((label) => label.checked) // Filter out checked chart labels
    .flatMap((label) => {
      // Map over filtered labels to push corresponding data
      if (label.id === 'hansenTreeCoverLoss') return filteredHansenTreeCoverLoss;
      if (label.id === 'country_specific_deforestation')
        return filteredCountrySpecificDeforestation;
      return []; // Return empty array for labels not matching any condition
    });

  const barChartData =
    selectedOptionId === argentinaOtbn.id ? otbnBarChartData : treeCoverLossBarChartData;

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

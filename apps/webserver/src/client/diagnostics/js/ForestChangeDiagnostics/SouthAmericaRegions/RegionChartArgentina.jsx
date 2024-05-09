import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import InfoIcon from 'material-ui/svg-icons/action/info';
import CardContent from '@mui/material/CardContent';
import DateRangeSlider from './DateRangeSlider';
import BarChart from '../../common/BarChart';
import PieChart from '../../common/PieChart';
import ChartsSelectorArgentina from './ChartsSelectorArgentina';
import DiagnosticsChartHeader from '../../common/DiagnosticsChartHeader';
import { formatDecimals } from '../../../../common/js/utils/diagnostics.utils';
import { chartDatasetConfigs, regionConstants, otbnChartLabels } from './regions.constants';
import { getBarChartData } from './getBarChartData';
import { useQuery } from '../../../../common/js/hooks';
import { getDataAndCheckIfAllYearsZero } from './barChart.utils';
import '../../common/DiagnosticsChartContainer.scss';

function RegionChartArgentina({ listId, data, fireDownload }) {
  const query = useQuery();
  const locationId = query.get('locationId');
  const {
    argentinaTreeCoverLoss,
    protectedAreas,
    indigenousTerritories,
    otbn,

    wdpaOverlapCountry,
    landmarkOverlapCountry,
  } = chartDatasetConfigs;

  const [chartsConfiguration, setChartsConfiguration] = useState([
    argentinaTreeCoverLoss,
    protectedAreas,
    indigenousTerritories,
    otbn,
  ]);

  const [selectedOptionId, setSelectedOptionId] = useState(chartsConfiguration[0].id);

  const [dateRange, setDateRange] = useState({
    startYear: regionConstants.startYear,
    endYear: regionConstants.endYear,
  });

  const [argentinaPieChartsData, setArgentinaPieChartsData] = useState({});

  function handleDateRangeChange(newDateRange) {
    setDateRange(newDateRange);
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

      return updatedOptions;
    });
  };

  useEffect(() => {
    handleDateRangeChange({
      startYear: regionConstants.startYear,
      endYear: regionConstants.endYear,
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

  const [isAllDataEmpty, setIsAllDataEmpty] = useState(false);

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

          const allEmpty = chartsConfiguration.every((config) =>
            config.chartLabels.every((label) => getDataAndCheckIfAllYearsZero(data, label.dataPath))
          );
          setAllDataEmpty(allEmpty);
        }
      })
      .catch((e) => {
        console.warn(e);
      });
  }, [listId]);

  const WDPA = formatDecimals(argentinaPieChartsData.WDPA);
  const landmark = formatDecimals(argentinaPieChartsData.landmark);

  let barChartData = [];

  if (!allDataEmpty) {
    barChartData = getBarChartData(
      argentinaPieChartsData,
      dateRange,
      chartsConfiguration.find((config) => config.id === selectedOptionId).chartLabels
    );
  }

  return (
    <>
      <DiagnosticsChartHeader
        title={regionConstants.chartsSelectorTitle}
        informationBubbleId={regionConstants.informationBubbleId}
        fireDownload={fireDownload}
        downloadId={regionConstants.downloadId}
      />
      <Card>
        <CardContent>
          <div className="diagnostics-chart-container">
            <div className="diagnostics-chart-container__chart">
              {allDataEmpty ? (
                <div>No data available for any chart selection.</div>
              ) : (
                <BarChart data={barChartData} />
              )}
              {selectedOptionId === argentinaTreeCoverLoss.id && !allDataEmpty && (
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
              argentinaPieChartsData={argentinaPieChartsData}
            />
          </div>
        </CardContent>
      </Card>

      <DateRangeSlider
        id={regionConstants.id}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        startYear={regionConstants.startYear}
        endYear={regionConstants.endYear}
      />

      <PieChart
        data={argentinaOtbnAreaData}
        chartLabels={chartDatasetConfigs.otbn.chartLabels}
        title={regionConstants.diagnosticTitle}
        informationBubbleId={regionConstants.informationBubbleId}
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

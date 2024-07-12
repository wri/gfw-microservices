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
import { chartDatasetConfigs, regionConstants } from './regions.constants';
import { getBarChartData } from './getBarChartData';
import { useQuery } from '../../../../common/js/hooks';
import { getDataAndCheckIfAllYearsZero, addNoOverlapArea } from './barChart.utils';
import '../../common/DiagnosticsChartContainer.scss';

import { regionIds } from './regions.constants';

export function RegionChartByCountry({ listId, data, fireDownload, country }) {
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

  const [countryPieChartsData, setCountryPieChartsData] = useState({});

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

  const [isAllDataEmpty, setIsAllDataEmpty] = useState(false);

  useEffect(() => {
    const fcdParams = {
      listId,
      locationId,
      country: country === regionIds.ARGENTINA ? 'Argentina' : 'Colombia',
      countryGadm: country.substring(0, 3).toUpperCase(),
      category: ['WDPA', 'landmark', 'country', 'classified_region'],
    };

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
          setCountryPieChartsData(data);

          const isAllEmpty = chartsConfiguration.every((config) =>
            config.chartLabels.every((label) => getDataAndCheckIfAllYearsZero(data, label.dataPath))
          );
          setIsAllDataEmpty(isAllEmpty);
        }
      })
      .catch((e) => {
        console.warn(e);
      });
  }, [listId, country]);

  let barChartData = [];

  if (!isAllDataEmpty) {
    barChartData = getBarChartData(
      countryPieChartsData,
      dateRange,
      chartsConfiguration.find((config) => config.id === selectedOptionId).chartLabels
    );
  }

  const argentinaOtbnAreaData = formatDecimals(JSON.parse(data?.arg_otbn_area) || {});

  const argentinaPieChartData =
    Object.keys(argentinaOtbnAreaData).length !== 0
      ? addNoOverlapArea(argentinaOtbnAreaData, data.total_area, 'Outside of OTBN')
      : {};

  const showProtectedAreasPieChart =
    countryPieChartsData?.WDPA && !countryPieChartsData?.WDPA?.error;

  const protectedAreasPieChartData = showProtectedAreasPieChart
    ? addNoOverlapArea(
        countryPieChartsData?.WDPA?.overlap,
        data.total_area,
        'Outside of Protected Areas'
      )
    : {};
  const protectedAreasPieChartFormattedData = formatDecimals(protectedAreasPieChartData);

  const showIndigenousTerritoriesPieChart =
    countryPieChartsData?.landmark && !countryPieChartsData?.landmark?.error;
  const indigenousTerritoriesPieCharFormattedData = formatDecimals(
    countryPieChartsData?.landmark?.overlap
  );

  return (
    <>
      {country === regionIds.ARGENTINA && (
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
                  {isAllDataEmpty ? (
                    <div>No data available for any chart selection.</div>
                  ) : (
                    <BarChart data={barChartData} />
                  )}
                  {selectedOptionId === argentinaTreeCoverLoss.id && !isAllDataEmpty && (
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
                  argentinaPieChartsData={countryPieChartsData}
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
            data={argentinaPieChartData}
            chartLabels={chartDatasetConfigs.otbn.chartLabels}
            title={regionConstants.diagnosticTitle}
            informationBubbleId={regionConstants.informationBubbleId}
          />
        </>
      )}

      {showProtectedAreasPieChart && (
        <PieChart
          data={protectedAreasPieChartFormattedData}
          chartLabels={wdpaOverlapCountry.chartLabels}
          title={wdpaOverlapCountry.diagnosticTitle}
          informationBubbleId={
            country !== regionIds.COLOMBIA && wdpaOverlapCountry.informationBubbleId
          }
          hideChartLabels={country === regionIds.COLOMBIA}
        />
      )}
      {showIndigenousTerritoriesPieChart && (
        <PieChart
          data={indigenousTerritoriesPieCharFormattedData}
          chartLabels={landmarkOverlapCountry.chartLabels}
          title={landmarkOverlapCountry.diagnosticTitle}
          informationBubbleId={
            country !== regionIds.COLOMBIA && landmarkOverlapCountry.informationBubbleId
          }
          hideChartLabels={country === regionIds.COLOMBIA}
        />
      )}
    </>
  );
}

import { useState, useEffect } from 'react';

import { Card, CardContent } from '@mui/material';

import InfoIcon from 'material-ui/svg-icons/action/info';
import DateRangeSlider from './DateRangeSlider';
import BarChart from '../../common/BarChart';
import PieChart from '../../common/PieChart';
import ChartsSelectorArgentina from './ChartsSelectorArgentina';
import DiagnosticsChartHeader from '../../common/DiagnosticsChartHeader';
import { formatDecimals } from '../../../../common/js/utils/diagnostics.utils';
import {
  chartDatasetConfigs,
  regionConstants,
  chartDatasetConfigsColombia,
  legacyAnalysisErrorMessage,
} from './regions-constants';
import { getBarChartData } from './getBarChartData';
import { useQuery } from '../../../../common/js/hooks';
import {
  getDataAndCheckIfAllYearsZero,
  addNoOverlapArea,
  updateCheckedLabelsForChartDatasetConfig,
} from './barChart.utils';
import '../../common/DiagnosticsChartContainer.scss';

import { regionIds } from './regions-constants';
import { BarChartTreeCoverLossColombia } from './BarChartTreeCoverLossColombia';

export function RegionChartByCountry({ listId, data, fireDownload, country, totalArea }) {
  const query = useQuery();
  const locationId = query.get('locationId');

  const {
    argentinaTreeCoverLoss,
    protectedAreas,
    indigenousTerritories,
    otbn,
    wdpaOverlapCountry,
    landmarkOverlapCountry,
    otbnPieChart,
  } = chartDatasetConfigs;

  const {
    id: regionConstantsId,
    chartsSelectorTitle,
    diagnosticTitle,
    informationBubbleId,
    downloadId,
    startYear,
    endYear,
  } = regionConstants[country];

  const [chartsConfiguration, setChartsConfiguration] = useState([
    argentinaTreeCoverLoss,
    protectedAreas,
    indigenousTerritories,
    otbn,
  ]);

  const [selectedOptionId, setSelectedOptionId] = useState(chartsConfiguration[0].id);

  const [dateRange, setDateRange] = useState({
    startYear: startYear,
    endYear: endYear,
  });

  const [countryPieChartsData, setCountryPieChartsData] = useState({});

  const isArgentinaAnalysisLegacy = data.country_area === null;
  const shouldHideArgentinaPieCharts = country === regionIds.ARGENTINA && isArgentinaAnalysisLegacy;

  function handleDateRangeChange(newDateRange) {
    setDateRange(newDateRange);
  }

  const handleCheckedLabelsUpdate = (optionId, labelId, isChecked) => {
    setChartsConfiguration((prevOptions) =>
      updateCheckedLabelsForChartDatasetConfig({
        optionId,
        labelId,
        isChecked,
        options: prevOptions,
      })
    );
  };

  useEffect(() => {
    handleDateRangeChange({
      startYear: startYear,
      endYear: endYear,
    });
  }, []);

  const [isAllDataEmpty, setIsAllDataEmpty] = useState(false);

  const countryGadm = country.substring(0, 3).toUpperCase();

  useEffect(() => {
    const fcdParams = {
      listId,
      locationId,
      country: country === regionIds.ARGENTINA ? 'Argentina' : 'Colombia',
      countryGadm,
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
    const chartConfiguration = chartsConfiguration.find((config) => config.id === selectedOptionId);

    barChartData = getBarChartData(
      countryPieChartsData,
      dateRange,
      chartConfiguration?.chartLabels
    );
  }

  const argentinaOtbnAreaData = formatDecimals(JSON.parse(data?.arg_otbn_area) || '{}');

  const argentinaPieChartData =
    Object.keys(argentinaOtbnAreaData).length !== 0
      ? addNoOverlapArea(argentinaOtbnAreaData, totalArea, 'Outside of OTBN')
      : {};

  const showProtectedAreasPieChart =
    countryPieChartsData?.WDPA && !countryPieChartsData?.WDPA?.error;

  const protectedAreasPieChartData = showProtectedAreasPieChart
    ? addNoOverlapArea(countryPieChartsData?.WDPA?.overlap, totalArea, 'Outside of Protected Areas')
    : {};
  const protectedAreasPieChartFormattedData = formatDecimals(protectedAreasPieChartData);

  const showIndigenousTerritoriesPieChart =
    countryPieChartsData?.landmark && !countryPieChartsData?.landmark?.error;
  const indigenousTerritoriesPieChartFormattedData = formatDecimals(
    countryPieChartsData?.landmark?.overlap
  );

  const showClassifiedRegionOverlapPieChart =
    countryPieChartsData?.classified_region && !countryPieChartsData?.classified_region?.error;

  const classifiedRegionOverlapPieChartFormattedData = formatDecimals(
    countryPieChartsData?.classified_region?.overlap
  );

  return (
    <>
      {country === regionIds.ARGENTINA && (
        <>
          <DiagnosticsChartHeader
            title={chartsSelectorTitle}
            informationBubbleId={informationBubbleId}
            fireDownload={fireDownload}
            downloadId={downloadId}
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
                      Bars with a lighter green hue indicate that the year is approximate.
                    </div>
                  )}
                </div>

                <ChartsSelectorArgentina
                  onCheckedLabelsUpdate={handleCheckedLabelsUpdate}
                  chartsConfiguration={chartsConfiguration}
                  onOptionChange={setSelectedOptionId}
                  selectedOptionId={selectedOptionId}
                  argentinaPieChartsData={countryPieChartsData}
                />
              </div>
            </CardContent>
          </Card>

          <DateRangeSlider
            id={regionConstantsId}
            dateRange={dateRange}
            setDateRange={handleDateRangeChange}
            startYear={startYear}
            endYear={endYear}
          />

          {shouldHideArgentinaPieCharts ? (
            <div>{legacyAnalysisErrorMessage}</div>
          ) : (
            <PieChart
              data={argentinaPieChartData}
              chartLabels={otbnPieChart.chartLabels}
              title={diagnosticTitle}
              informationBubbleId={informationBubbleId}
            />
          )}
        </>
      )}

      {country === regionIds.COLOMBIA && (
        <>
          <DiagnosticsChartHeader
            title={chartsSelectorTitle}
            informationBubbleId={informationBubbleId}
            fireDownload={fireDownload}
            downloadId={downloadId}
          />
          <BarChartTreeCoverLossColombia
            rawBarChartData={countryPieChartsData}
            isAllDataEmpty={isAllDataEmpty}
            fireDownload={fireDownload}
          />
          {showClassifiedRegionOverlapPieChart && (
            <PieChart
              data={classifiedRegionOverlapPieChartFormattedData}
              chartLabels={chartDatasetConfigsColombia.classifiedRegionOverlap}
              title={chartDatasetConfigsColombia.classifiedRegionOverlap.chartsSelectorTitle}
              informationBubbleId={chartDatasetConfigsColombia.classifiedRegionOverlap.infoBubbleId}
              hasSecondarySubLayers
            />
          )}
        </>
      )}

      {!shouldHideArgentinaPieCharts && (
        <>
          {showProtectedAreasPieChart && (
            <PieChart
              data={protectedAreasPieChartFormattedData}
              chartLabels={wdpaOverlapCountry.chartLabels}
              title={wdpaOverlapCountry.diagnosticTitle}
              informationBubbleId={
                country !== regionIds.COLOMBIA
                  ? wdpaOverlapCountry.informationBubbleId
                  : wdpaOverlapCountry.informationBubbleColId
              }
            />
          )}
          {showIndigenousTerritoriesPieChart && (
            <PieChart
              data={indigenousTerritoriesPieChartFormattedData}
              preview={true}
              chartLabels={landmarkOverlapCountry.chartLabels}
              title={landmarkOverlapCountry.diagnosticTitle}
              informationBubbleId={
                country !== regionIds.COLOMBIA
                  ? landmarkOverlapCountry.informationBubbleId
                  : landmarkOverlapCountry.informationBubbleColId
              }
            />
          )}
        </>
      )}
    </>
  );
}

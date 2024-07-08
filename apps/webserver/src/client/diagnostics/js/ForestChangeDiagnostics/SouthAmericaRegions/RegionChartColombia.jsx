import React, { useEffect, useState } from 'react';

import '../../common/DiagnosticsChartContainer.scss';

import { useQuery } from '../../../../common/js/hooks';
import PieChart from '../../common/PieChart';

import { formatDecimals } from '../../../../common/js/utils/diagnostics.utils';
import { addNoOverlapArea } from './barChart.utils';
import { chartDatasetConfigs } from './regions.constants';

export function RegionChartColombia({ data, listId }) {
  const [argentinaPieChartsData, setArgentinaPieChartsData] = useState({});

  const query = useQuery();
  const locationId = query.get('locationId');

  const { wdpaOverlapCountry, landmarkOverlapCountry } = chartDatasetConfigs;

  const fcdParams = {
    listId,
    locationId,
    country: 'Colombia',
    countryGadm: 'COL',
    category: ['WDPA', 'landmark'],
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

  const showProtectedAreasPieChart =
    argentinaPieChartsData?.WDPA && !argentinaPieChartsData?.WDPA?.error;

  const protectedAreasPieChartData = showProtectedAreasPieChart
    ? addNoOverlapArea(
        argentinaPieChartsData?.WDPA?.overlap,
        data.total_area,
        'Outside of Protected Areas'
      )
    : {};

  const protectedAreasPieChartFormattedData = formatDecimals(protectedAreasPieChartData);

  const showIndigenousTerritoriesPieChart =
    argentinaPieChartsData?.landmark && !argentinaPieChartsData?.landmark?.error;
  const indigenousTerritoriesPieCharFormattedData = formatDecimals(
    argentinaPieChartsData?.landmark?.overlap
  );

  return (
    <>
      {showProtectedAreasPieChart && (
        <PieChart
          data={protectedAreasPieChartFormattedData}
          chartLabels={wdpaOverlapCountry.chartLabels}
          title={wdpaOverlapCountry.diagnosticTitle}
          hideChartLabels
        />
      )}
      {showIndigenousTerritoriesPieChart && (
        <PieChart
          data={indigenousTerritoriesPieCharFormattedData}
          chartLabels={landmarkOverlapCountry.chartLabels}
          title={landmarkOverlapCountry.diagnosticTitle}
          hideChartLabels
        />
      )}
    </>
  );
}

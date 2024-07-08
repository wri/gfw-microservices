import React, { useState } from 'react';
import RegionChart from './RegionChart';
import RegionChartArgentina from './RegionChartArgentina';
import { RegionChartColombia } from './RegionChartColombia';
import RegionChartsTabs from './RegionChartsTabs';
import SouthAmericaRegionsWithoutArgentina from '../SouthAmericaRegionsWithoutArgentina';
import { regionsTabs, regionIds } from './regions.constants';
import featureFlags from '../../../../../utils/general.utils';

function RegionChartsContainer({
  listId,
  data,
  fireDownload,
  diagnosticView,
  filteredData,
  togglePopover,
  getYearlyData,
  parseYearlyData,
  assignHighchartColor,
  getFilteredLocations,
  getYearlyHighchartSeries,
  getCategoricalHighchartSeries,
}) {
  const { isArgentinaDeforestationAvailable, isColombiaAvailable } = featureFlags;

  const [selectedTab, setSelectedTab] = useState(regionIds.REGIONAL);

  const argOtbnArea = JSON.parse(data.arg_otbn_area || '{}');
  const countryArea = JSON.parse(data.country_area || '{}');

  const argentinaDataNotAvailable =
    Object.entries(argOtbnArea).length === 0 && !(countryArea?.ARG > 0);
  const colombiaDataNotAvailable = !(countryArea?.COL > 0);

  let availableTabs = regionsTabs;
  if (argentinaDataNotAvailable) {
    availableTabs = regionsTabs.filter((tab) => tab.id !== regionIds.ARGENTINA);
  }

  if (!isColombiaAvailable || colombiaDataNotAvailable) {
    availableTabs = availableTabs.filter((tab) => tab.id !== regionIds.COLOMBIA);
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <div className="locations-diagnostics-section-title">South America</div>
      <hr />
      <RegionChartsTabs
        regionsTabs={availableTabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      {selectedTab === regionIds.ARGENTINA && !isArgentinaDeforestationAvailable && (
        <RegionChart listId={listId} data={data} fireDownload={fireDownload} />
      )}

      {selectedTab === regionIds.ARGENTINA && isArgentinaDeforestationAvailable && (
        <RegionChartArgentina listId={listId} data={data} fireDownload={fireDownload} />
      )}

      {selectedTab === regionIds.COLOMBIA && <RegionChartColombia data={data} listId={listId} />}

      {selectedTab === regionIds.REGIONAL && (
        <SouthAmericaRegionsWithoutArgentina
          diagnosticView={diagnosticView}
          fireDownload={fireDownload}
          filteredData={filteredData}
          togglePopover={togglePopover}
          getYearlyData={getYearlyData}
          parseYearlyData={parseYearlyData}
          assignHighchartColor={assignHighchartColor}
          getFilteredLocations={getFilteredLocations}
          getYearlyHighchartSeries={getYearlyHighchartSeries}
          getCategoricalHighchartSeries={getCategoricalHighchartSeries}
        />
      )}
    </div>
  );
}

export default RegionChartsContainer;

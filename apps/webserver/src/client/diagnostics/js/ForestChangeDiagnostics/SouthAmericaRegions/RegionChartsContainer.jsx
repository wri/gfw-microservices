import React, { useState } from 'react';
import { RegionChartByCountry } from './RegionChartByCountry';
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
  isGfwList
}) {
  const { isColombiaAvailable } = featureFlags;
  const [selectedTab, setSelectedTab] = useState(regionIds.REGIONAL);

  const argOtbnArea = isGfwList ? {} : JSON.parse(data.arg_otbn_area || '{}');
  const countryArea = isGfwList ? {} : JSON.parse(data.country_area || '{}');

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

  const shouldRenderRegionChartByCountry =
    selectedTab === regionIds.ARGENTINA || selectedTab === regionIds.COLOMBIA;

  return (
    <div style={{ marginTop: '30px' }}>
      <div className="locations-diagnostics-section-title">South America</div>
      <hr />
      <RegionChartsTabs
        regionsTabs={availableTabs}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      {shouldRenderRegionChartByCountry && (
        <RegionChartByCountry
          data={data}
          listId={listId}
          fireDownload={fireDownload}
          country={selectedTab}
        />
      )}

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

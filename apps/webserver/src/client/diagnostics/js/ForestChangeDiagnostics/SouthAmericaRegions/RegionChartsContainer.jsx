import { useState } from 'react';
import { RegionChartByCountry } from './RegionChartByCountry';
import RegionChartsTabs from './RegionChartsTabs';
import SouthAmericaRegionsWithoutArgentina from '../SouthAmericaRegionsWithoutArgentina';
import { regionsTabs, regionIds } from './regions-constants';

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
  isGfwList,
}) {
  const [selectedTab, setSelectedTab] = useState(regionIds.REGIONAL);

  // Simplified Argentina availability check - use country_area.ARG
  const isArgentinaDataAvailable = getTotalAreaPerCountry(data, 'ARG', isGfwList) > 0;

  const isColombiaDataAvailable = getTotalAreaPerCountry(data, 'COL', isGfwList) > 0;

  let availableTabs = regionsTabs;

  if (!isArgentinaDataAvailable) {
    availableTabs = regionsTabs.filter((tab) => tab.id !== regionIds.ARGENTINA);
  }

  if (!isColombiaDataAvailable) {
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
          totalArea={getTotalAreaPerCountry(
            data,
            selectedTab.substring(0, 3).toUpperCase(),
            isGfwList
          )}
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

const getTotalAreaPerCountry = (data, countryGadm, isGfwList) => {
  if (isGfwList) {
    return 0;
  }

  const countryArea = JSON.parse(data.country_area || '{}');

  return countryArea[countryGadm] ?? 0;
};

export default RegionChartsContainer;

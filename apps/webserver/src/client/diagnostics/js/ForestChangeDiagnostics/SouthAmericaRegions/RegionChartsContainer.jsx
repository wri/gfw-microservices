import React, { useState } from 'react';
import RegionChart from './RegionChart';
import RegionChartArgentina from './RegionChartArgentina';
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
  const { isArgentinaDeforestationAvailable } = featureFlags;

  const [selectedTab, setSelectedTab] = useState(regionIds.REGIONAL);

  const argentinaOtnbDataNotAvailable =
    Object.entries(JSON.parse(data.arg_otbn_area || '{}')).length === 0;

  let availableTabs = regionsTabs;
  if (argentinaOtnbDataNotAvailable) {
    availableTabs = regionsTabs.filter((tab) => tab.id !== regionIds.ARGENTINA);
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

import React, { Component } from 'react';
import store from '../store';
import mapUtils from '../utils/mapUtils';
import { calculateAlerts } from '../utils/dashboard.utils';
import dictionary from '../utils/dictionary';
import { prettifyNum } from '../../../common/js/utils/diagnostics.utils';
import { selectAlert, selectTimeframe } from '../actions/dashboardActions';
import GfwSelect from '../../../common/js/components/GfwSelect';
import { proLayers } from '../../../common/js/proLayers.config';
import redirectToPage from '../../../common/js/utils/redirect';

const timeframeOptions = [
  {
    label: 'Day',
    value: 'DAY',
    category: ['VIIRS'],
  },
  {
    label: 'Week',
    value: 'WEEK',
    category: ['GLAD', 'VIIRS'],
  },
  {
    label: 'Month',
    value: 'MONTH',
    category: ['GLAD'],
  },
  {
    label: 'Quarter',
    value: 'QUARTER',
    category: ['GLAD'],
  },
  {
    label: 'Year',
    value: 'YEAR',
    category: ['GLAD'],
  },
];

const alertsShownOptions = [
  {
    value: 'GLAD',
    label: 'Deforestation (Integrated Alerts)',
  },
  {
    value: 'VIIRS',
    label: 'Fires (VIIRS)',
  },
];

export default class DashboardSettings extends Component {
  handleViewMap = () => {
    const {
      selectedAlert,
      selectedList,
      selectedTimeframe,
      locationFilters,
      gfwLists,
      zoomLevel,
      geoJSON,
      failedGeoJSON,
      filteredLocationGeoJSON,
      filteredDissolvedGeoJSON,
    } = this.props;
    if (!selectedList || !selectedList.id) {
      return;
    }

    // const {   } = this.state;
    const layers =
      selectedAlert === 'GLAD'
        ? [proLayers.integratedDeforestationAlertsID]
        : [proLayers.viirsActiveFiresID];
    let numLocations,
      filteredIDs,
      filterCount = 0;

    const viewCenter = mapUtils.getExtent();
    const mapExtent = mapUtils.getMapExtent();
    const zScale = dictionary.zoomLevel_scale[zoomLevel];

    const { withAlerts, totalLocations, locationIdsWithAlerts, locationIdsWithoutAlerts } =
      calculateAlerts(
        geoJSON,
        failedGeoJSON,
        selectedAlert,
        filteredLocationGeoJSON.features,
        filteredDissolvedGeoJSON
      );

    const { ALERTS, NOALERTS } = locationFilters;

    if (ALERTS) {
      if (NOALERTS) {
        numLocations = totalLocations;
        filteredIDs = filteredLocationGeoJSON.features.map((feature) => {
          return feature.properties.location_id;
        });
      } else {
        numLocations = withAlerts;
        filteredIDs = locationIdsWithAlerts;
      }
    } else if (NOALERTS) {
      numLocations = totalLocations - withAlerts;
      filteredIDs = locationIdsWithoutAlerts;
    } else {
      numLocations = totalLocations;
      filteredIDs = filteredLocationGeoJSON.features.map((feature) => {
        return feature.properties.location_id;
      });
    }

    for (const alert in locationFilters) {
      if (locationFilters[alert]) {
        filterCount++;
      }
    }

    const sendData = {
      a: ALERTS,
      t: selectedTimeframe,
      l: layers,
      i: selectedList.id,
      numLocations: prettifyNum(numLocations),
      name: selectedList.list_name,
      // listView: ,
      filterCount,
      filteredLists: filteredIDs,
      canopyDensity: '',
      path: 'dashboard',
      gfwlist: gfwLists.includes(selectedList),
      dashboard_map_extent: mapExtent,
      showFullListMap: true,
      totalNumberOfLocationsInList: selectedList.list_locations_count,
      ...(gfwLists.includes(selectedList) && {
        lat: viewCenter.latitude,
        lng: viewCenter.longitude,
        z: zScale,
      }),
    };

    redirectToPage('/map', sendData);
    gtag('event', 'view map clicked', {
      event_category: 'Dashboard Click',
      event_label: 'user is re-directed to the map page via a Dashboard View Map click',
    });
  };

  createTimeframeOptions = () => {
    const { selectedAlert, selectedTimeframe } = this.props;
    const filteredOptions = timeframeOptions.filter((option) =>
      option.category.includes(selectedAlert)
    );
    return filteredOptions.map((option, idx) => {
      return (
        <div key={idx}>
          <input
            type="radio"
            name="dashboard-timeframe"
            id={`${option.label}-${idx}`}
            value={option.value}
            checked={selectedTimeframe === option.value}
            onChange={(evt) => store.dispatch(selectTimeframe(evt.target.value))}
          />
          <label htmlFor={`${option.label}-${idx}`}>{option.label}</label>
        </div>
      );
    });
  };

  render() {
    const { selectedAlert } = this.props;
    return (
      <div className="flex-grid space-between dashboard-section__padding underline">
        <div id="AlertsShown" className="flex-grid align-center">
          <span className="profile-label dashboard-setting__title">ALERTS SHOWN</span>
          <GfwSelect
            value={{ value: selectedAlert }}
            style={{ width: '245px' }}
            options={alertsShownOptions}
            onChange={(evt) => store.dispatch(selectAlert(evt.value))}
          />
        </div>
        <div className="flex-grid align-center">
          <div className="dashboard-setting__title">TIMEFRAME</div>
          {this.createTimeframeOptions()}
          <div
            className="flex-grid-column align-center dashboard-svg__container dashboard-svg__globe"
            onClick={this.handleViewMap}
          >
            <svg>
              <use xlinkHref="#view-map-globe" />
            </svg>
            <span style={{ color: '#a5a5a5' }}>View Map</span>
          </div>
        </div>
      </div>
    );
  }
}

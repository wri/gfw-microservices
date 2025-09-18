import { Component } from 'react';
import store from '../store';
import { selectAlert, selectTimeframe } from '../actions/dashboardActions';
import GfwSelect from '../../../common/js/components/GfwSelect';
import { proLayers } from '../../../common/js/proLayers.config';
import redirectToMap from '../../../common/js/utils/redirect';
import { timeframeOptions, alertsShownOptions } from './alerts.constants';

export default class DashboardSettings extends Component {
  filterselectedLocations = () => {
    const { selectedAdmin, geoJSON } = this.props;

    if (selectedAdmin !== '' && !!geoJSON) {
      return geoJSON.features
        .filter((location) => location.properties.gadm_id.includes(selectedAdmin))
        .map((location) => location.properties.location_id);
    }

    return [];
  };

  handleViewMap = () => {
    const { selectedAlert, selectedList, selectedTimeframe, selectedAdmin } = this.props;
    if (!selectedList || !selectedList.id) {
      return;
    }
    const visibleLayers =
      selectedAlert === 'GLAD'
        ? [proLayers.integratedDeforestationAlertsID]
        : [proLayers.viirsActiveFiresID];

    const sendData = {
      listId: selectedList.id,
      selectedTimeframe,
      visibleLayers,
      isGfwList: selectedList.isGlobalForestWatchList,
      ...(selectedList?.is_shared ? { isSharedList: selectedList.is_shared } : {}),
    };

    if (selectedAdmin !== '') {
      sendData['selectedLocations'] = this.filterselectedLocations();
    }

    redirectToMap(sendData);
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

import React, { Component } from 'react';
import EsriMap from 'esri/Map';
import Basemap from 'esri/Basemap';
import MapView from 'esri/views/MapView';
import MapImageLayer from 'esri/layers/MapImageLayer';
import Button from '../../../common/js/components/Button';
import IconButton from 'material-ui/IconButton';
import InfoIcon from 'material-ui/svg-icons/action/info';
import ZoomIcon from 'material-ui/svg-icons/action/zoom-out';
import Popover from 'material-ui/Popover';
import isEqual from 'lodash/isEqual';
import Deferred from 'dojo/Deferred';

// REDUX - Store
import store from '../store';
import {
  decrementZoomLevel,
  saveMap,
  setZoomLevelTotal,
  updateInfoBubbleCache,
  updateLocationFilter,
  selectAdmin,
} from '../actions/dashboardActions';

// Components
import InfoBubbleContent from '../../../common/js/components/InfoBubbleContent';
import SvgLinearGradients from '../../../common/js/components/SvgLinearGradients';

// Utils
import mapUtils, { getAlertsTotal } from '../utils/mapUtils';

// Configs
import { dashboardPage, DATA_API_URL } from '../../../common/js/config';

// Styles
import '../../css/_dashboardMap.scss';

export default class DashboardMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLegendTooltip: false,
      displayPopover: false,
      bubbleData: {},
      popoverLoading: '',
    };
  }

  componentDidMount() {
    const layer = new MapImageLayer({
      id: 'BASEMAP',
      url: 'https://gfwpro-gis.globalforestwatch.org/arcgis/rest/services/GADM36_admin/MapServer',
      sublayers: [
        {
          id: 4,
          visible: false,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-fill',
              color: '#e0e0e0',
              style: 'solid',
              outline: {
                color: 'white',
                width: '0.5px',
              },
            },
          },
        },
        {
          id: 5,
          visible: false,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-fill',
              color: '#e0e0e0',
              style: 'solid',
              outline: {
                color: 'white',
                width: '0.5px',
              },
            },
          },
        },
        {
          id: 6,
          visible: true,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-fill',
              color: '#e0e0e0',
              style: 'solid',
              outline: {
                color: 'white',
                width: '0.5px',
              },
            },
          },
        },
      ],
    });

    const basemap = new Basemap({
      baseLayers: [layer],
      id: 'ADMIN-BASEMAP',
      title: 'ADMIN-BASEMAP',
    });

    const map = new EsriMap({
      basemap: basemap,
    });

    const view = new MapView({
      container: this.refs.dashboardMap,
      map: map,
      zoom: 10, // Sets zoom level based on level of detail (LOD)
      center: [15, 30], // Sets center point of view using longitude,latitude
      ui: {
        components: [],
      },
    });

    window.map = map;
    window.view = view;

    view.when(mapUtils.initializeMap);
    store.dispatch(saveMap(map));
  }

  componentDidUpdate(prevProps) {
    const { selectedAlert, data } = this.props;

    const propsDataAndPreviousPropsDataNotEqual = !isEqual(data, prevProps.data);
    const propsDataAndPreviousPropsSelectedAlertNotEqual = !isEqual(
      selectedAlert,
      prevProps.selectedAlert
    );
    if (propsDataAndPreviousPropsDataNotEqual || propsDataAndPreviousPropsSelectedAlertNotEqual) {
      const { map, view, selectedTimeframe, locationFilters, zoomLevel, rawData } = this.props;

      mapUtils.updateLayer(
        map,
        view,
        data,
        selectedAlert,
        selectedTimeframe,
        locationFilters,
        zoomLevel,
        rawData
      );
    }
  }

  handleLocationFilterChange = (evt) => {
    const { locationFilters } = this.props;
    const target = evt.target;
    const updatedFilter = { [target.name]: target.checked };
    store.dispatch(updateLocationFilter(Object.assign(locationFilters, updatedFilter)));
    gtag('event', 'Locations with alerts checkbox clicked', {
      event_category: 'Dashboard Click',
      event_label: 'user checked locations with alerts/no alerts',
    });
  };

  showLegendTooltip = (evt) => {
    this.setState({ showLegendTooltip: true });
  };

  hideLegendTooltip = (evt) => {
    this.setState({ showLegendTooltip: false });
  };

  handleMouseMove = (evt) => {
    const element = document.getElementById('bubblePopup');
    element.setAttribute(
      'style',
      `left:${evt.pageX + 10}px;top:${evt.pageY - element.clientHeight - 5}px`
    );
  };

  checkInfoBubbleCache = (id) => {
    return this.props.infoBubbleCache.hasOwnProperty(id) && this.props.infoBubbleCache[id] !== null;
  };

  togglePopover = (evt) => {
    evt.preventDefault();
    const target = evt.currentTarget;
    const infoBubbleId = target.id;

    const { infoBubbleCache } = this.props;

    this.setState({
      popoverLoading: infoBubbleId,
    });

    if (this.checkInfoBubbleCache(infoBubbleId)) {
      this.setState({
        displayPopover: true,
        bubbleData: infoBubbleCache[infoBubbleId],
        popoverLoading: '',
        anchorEl: target,
      });
      // early return if we have the info in cache
      return;
    }

    // if the info is not in the cache, go get it
    const promise = new Deferred();
    const request = new XMLHttpRequest();
    request.addEventListener('load', () => {
      const resp = JSON.parse(request.response);

      store.dispatch(updateInfoBubbleCache(infoBubbleId, resp.data));

      this.setState({
        displayPopover: true,
        bubbleData: resp.data,
        popoverLoading: '',
        anchorEl: target,
      });
    });

    request.onerror = () => {
      promise.resolve(false);
    };

    request.open('POST', `${DATA_API_URL}/dataApi/getInfoBubbleData/${infoBubbleId}`);
    request.send();

    gtag('event', 'info button clicked', {
      event_category: 'Dashboard Click',
      event_label: `user clicked on the info button for ${infoBubbleId}`,
    });
  };

  closePopover = () => {
    this.setState({
      displayPopover: false,
    });
  };

  render() {
    const { mapTitle, locationFilters, zoomLevelTotal } = this.props;
    const { showLegendTooltip, bubbleData, popoverLoading, displayPopover, anchorEl } = this.state;

    return (
      <div className="dashboard-map-legend__container">
        {/* Overlay ontop of the map */}
        <Popover
          open={displayPopover}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.closePopover}
        >
          <InfoBubbleContent bubbleData={bubbleData} closeBubble={this.closePopover} />
        </Popover>
        <div className="flex-grid space-between dashboard-map__title">
          <div className="flex-grid-column pad-left">
            <div className="flex-grid align-center space-between title">
              <span>Location Alert Map</span>
              <IconButton
                style={{ padding: 0, width: 34 }}
                className={`metadata-info-button ${
                  popoverLoading === dashboardPage.infoBubbleConfig.locationsAlertMap
                    ? 'metadata-icon-loading'
                    : ''
                }`}
                id={dashboardPage.infoBubbleConfig.locationsAlertMap}
                onClick={this.togglePopover}
              >
                <InfoIcon
                  color={`${
                    this.props.popoverLoading === dashboardPage.infoBubbleConfig.locationsAlertMap
                      ? '#262626'
                      : 'gray'
                  }`}
                />
              </IconButton>
            </div>
            <div className="subtitle">{mapTitle}</div>
          </div>
          <div className="flex-grid">
            <table>
              <tbody>
                <tr>
                  <td>LOCATIONS WITH</td>
                  <td>
                    <input
                      type="checkbox"
                      name="ALERTS"
                      id="ALERTS"
                      checked={locationFilters.ALERTS}
                      className="grey"
                      onChange={this.handleLocationFilterChange}
                    />
                    <label htmlFor="ALERTS">Alerts</label>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      name="NOALERTS"
                      id="NOALERTS"
                      checked={locationFilters.NOALERTS}
                      className="grey"
                      onChange={this.handleLocationFilterChange}
                    />
                    <label htmlFor="NOALERTS">No Alerts</label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* The map */}
        <div className="dashboard-map__container">
          <div className="dashboard-map" ref="dashboardMap" />
        </div>
        {/* Map footer elements */}
        <div className="flex-grid align-center space-between dashboard-section__padding dashboard-legend__container">
          <div className="flex-grid-column dashboard__click-to-zoom">
            <Button
              label="Zoom Out"
              icon={<ZoomIcon />}
              onClick={() => {
                const { zoomLevel, selectedAdmin } = this.props;
                let prevewaSelectedAdmin = selectedAdmin.split('.');
                prevewaSelectedAdmin.pop();
                prevewaSelectedAdmin = prevewaSelectedAdmin.join('.');

                store.dispatch(selectAdmin(prevewaSelectedAdmin));
                store.dispatch(decrementZoomLevel());
                store.dispatch(setZoomLevelTotal(getAlertsTotal(prevewaSelectedAdmin, zoomLevel)));
                gtag('event', 'Dashboard Map zoom out button clicked', {
                  event_category: 'Dashboard Click',
                  event_label: 'User click on a Zoom Out button',
                });
              }}
            />
            <p>Click on a bubble to zoom in.</p>
          </div>
          <div className="legend-container flex-grid space-between align-center">
            <div className="flex-grid-column dashboard-map__legend-item-container dashboard-map__legend-number-of-locations">
              <div className="legend-title">
                <div>NUMBER OF LOCATIONS</div>
              </div>
              <div className="legend-content bubblePopup__container">
                <div
                  className="flex-grid space-between align-center"
                  onMouseOver={this.showLegendTooltip}
                  onMouseLeave={this.hideLegendTooltip}
                  onMouseMove={this.handleMouseMove}
                >
                  <div
                    id="bubblePopup"
                    className={`${
                      showLegendTooltip ? '' : 'hidden'
                    } flex-grid-column dashboard-map__bubble-hover`}
                  >
                    <p>Legend</p>
                    <span>{`Small: 0-25% of ${zoomLevelTotal} locations`}</span>
                    <span>{`Medium: 25-50% of ${zoomLevelTotal} locations`}</span>
                    <span>{`Large: 50-75% of ${zoomLevelTotal} locations`}</span>
                    <span>{`X-Large: 75-100% of ${zoomLevelTotal} locations`}</span>
                  </div>
                  <div className="circle small" />
                  <div className="circle medium" />
                  <div className="circle large" />
                  <div className="circle x-large" />
                </div>
              </div>
            </div>
            <div className="flex-grid-column dashboard-map__legend-item-container">
              <div className="legend-title">
                <div>DENSITY OF ALERTS</div>
              </div>
              <div className="legend-content">
                <SvgLinearGradients
                  start={'#008000'}
                  middle={'#FF0'}
                  end={'#FFA500'}
                  width={'230'}
                  height={'15'}
                />
                <div className="flex-grid space-between">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

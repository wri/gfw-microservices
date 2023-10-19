import React, { Component } from 'react';
import isEqual from 'lodash/isEqual';

import DashboardChart from './DashboardChart';

import { calculateAlerts } from '../utils/dashboard.utils';
import { prettifyNum, formatPct } from '../../../common/js/utils/diagnostics.utils';

import '../../css/_dashboardFooter.scss';

export default class DashboardFooter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      withAlerts: 0,
      withinAlerts: 0,
      percentageAlerts: 0,
      totalAlerts: 0,
      totalLocations: 0,
      filteredLocationGeoJSON: this.props.filteredLocationGeoJSON,
      geoJSON: this.props.rawData.geojson,
      failedGeoJSON: this.props.rawData.failedGeoJSON,
      selectedTimeframe: this.props.selectedTimeframe,
      selectedList: this.props.selectedList,
      selectedAlert: this.props.selectedAlert,
      filteredDissolvedGeoJSON: this.props.filteredDissolvedGeoJSON,
    };
  }

  componentDidMount() {
    this.updateFooter();
  }

  componentDidUpdate(prevProps, prevState) {
    /******************************************** NOTE ********************************************
     The Dashboard summary should only change if one of the following events occur:
      * A new list of data is uploaded and the request for new data has returned
      * The timeline changes
      * The fires type changes between GLAD and VIIRS
    ***********************************************************************************************/

    const newTimeframeSelected = !isEqual(
      prevState.selectedTimeframe,
      this.props.selectedTimeframe
    );
    const newListSelected = !isEqual(prevState.selectedList, this.props.selectedList);
    const newData = !isEqual(prevProps.rawData, this.props.rawData);
    const switchBetweenGladAndViirs = !isEqual(prevProps.selectedAlert, this.props.selectedAlert);

    if (newTimeframeSelected || switchBetweenGladAndViirs || (newListSelected && newData)) {
      const {
        filteredLocationGeoJSON,
        selectedTimeframe,
        selectedList,
        selectedAlert,
        rawData,
        filteredDissolvedGeoJSON,
      } = this.props;
      const { geojson, failedGeoJSON } = rawData;

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          filteredLocationGeoJSON: filteredLocationGeoJSON,
          geoJSON: geojson,
          failedGeoJSON: failedGeoJSON,
          selectedTimeframe,
          selectedList,
          selectedAlert,
          filteredDissolvedGeoJSON,
        },
        this.updateFooter
      );
    }
  }

  updateFooter = () => {
    const { selectedAlert } = this.props;
    const { geoJSON, failedGeoJSON, filteredLocationGeoJSON, filteredDissolvedGeoJSON } =
      this.state;
    const { withAlerts, withinAlerts, percentageAlerts, totalAlerts, totalLocations } =
      calculateAlerts(
        geoJSON,
        failedGeoJSON,
        selectedAlert,
        filteredLocationGeoJSON,
        filteredDissolvedGeoJSON
      );

    this.setState({
      withAlerts,
      withinAlerts,
      percentageAlerts,
      totalAlerts,
      totalLocations,
    });
  };

  render() {
    const {
      withAlerts,
      withinAlerts,
      percentageAlerts,
      totalAlerts,
      totalLocations,
      filteredLocationGeoJSON,
      selectedAlert,
      selectedTimeframe,
      filteredDissolvedGeoJSON,
    } = this.state;

    return (
      <div className="dashboard-map-details__container flex-grid space-between">
        <div className="flex-grid-column dashboard-footer__table-container">
          <h3>Alerts Summary</h3>
          <table>
            <tbody>
              <tr>
                <td>{`${prettifyNum(withinAlerts)} of ${prettifyNum(totalLocations)}`}</td>
                <td>{`${prettifyNum(withAlerts)}`}</td>
                <td>{isNaN(percentageAlerts) ? '--' : `${formatPct(percentageAlerts)}%`}</td>
                <td>{prettifyNum(totalAlerts)}</td>
              </tr>
              <tr>
                <td>Total Locations</td>
                <td>Locations w/ Alerts</td>
                <td>of All Locations</td>
                <td>Alerts</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          className={`flex-grid-column dashboard-footer__chart-container ${
            selectedTimeframe === 'DAY' ? 'hidden' : ''
          }`}
        >
          <h3>Alerts History</h3>
          <DashboardChart
            selectedTimeframe={selectedTimeframe}
            selectedAlert={selectedAlert}
            filteredDissolvedGeoJSON={filteredDissolvedGeoJSON}
            filteredLocationGeoJSON={filteredLocationGeoJSON}
          />
        </div>
      </div>
    );
  }
}

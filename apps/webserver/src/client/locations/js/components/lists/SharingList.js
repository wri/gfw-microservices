import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';

import { locationsPage } from '../../../../common/js/config';
import { numberWithCommas } from '../../utils/locationsTableUtils';
import store from '../../../../locations/js/store';

class SharingList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { locationCount } = this.props;

    return (
      <div className="saved-locations-summary">
        <h3 className="saved-locations-summary__title">{locationsPage.lists.savedLocationsSummary}</h3>
        <table className="saved-locations-summary__inner">
          <tbody>
            <tr className="saved-locations-summary__row">
              <th scope="row" className="saved-locations-summary__key">
                {locationsPage.lists.allLocations}
              </th>
              <td className="saved-locations-summary__value">
                {numberWithCommas(locationCount.TotalCount ? locationCount.TotalCount : 0)}
              </td>
            </tr>
            <tr className="saved-locations-summary__row">
              <th scope="row" className="saved-locations-summary__key">
                {locationsPage.lists.investment}
              </th>
              <td className="saved-locations-summary__value">
                {numberWithCommas(locationCount.InvestmentCount ? locationCount.InvestmentCount : 0)}
              </td>
            </tr>
            <tr className="saved-locations-summary__row">
              <th scope="row" className="saved-locations-summary__key">
                {locationsPage.lists.commodity}
              </th>
              <td className="saved-locations-summary__value">
                {numberWithCommas(locationCount.CommodityCount ? locationCount.CommodityCount : 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default withRouter(SharingList);

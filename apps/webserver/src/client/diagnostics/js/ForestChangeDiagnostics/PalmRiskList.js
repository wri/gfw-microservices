import React, { Component } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { locationsPage } from '../../../common/js/config';
import { formatNum, prettifyNum } from '../../../common/js/utils/diagnostics.utils';
import { getLastValue, getLastYear } from '../../../locations/js/utils/locationsTableUtils';
import DiagnosticsChartHeader from '../common/DiagnosticsChartHeader';

const lastYear = locationsPage.diagnostics.lastDataYear;

const attributeValues = [
  { attribute: 'location_id', type: 'string' },
  { attribute: 'Location Name', type: 'string' },
  { attribute: 'commodity_mill_priority_level', type: 'yearly' },
  { attribute: 'commodity_threat_deforestation', type: 'yearly' },
  { attribute: 'commodity_threat_peat', type: 'yearly' },
  { attribute: 'commodity_threat_protected_areas', type: 'yearly' },
  { attribute: 'commodity_threat_fires', type: 'yearly' },
  { attribute: 'commodity_threat_overall_level', type: 'yearly' },
  { attribute: 'commodity_value_forest_extent', type: 'yearly' },
  { attribute: 'commodity_value_peat', type: 'yearly' },
  { attribute: 'commodity_value_protected_areas', type: 'yearly' },
  { attribute: 'commodity_value_overall_level', type: 'yearly' },
];

const riskValues = [
  { attribute: 'location_id', type: 'string' },
  { attribute: 'Location Name', type: 'string' },
  { attribute: 'commodity_mill_priority_level', type: 'yearly' },
  { attribute: 'commodity_threat_deforestation_level', type: 'yearly' },
  { attribute: 'commodity_threat_peat_level', type: 'yearly' },
  { attribute: 'commodity_threat_protected_areas_level', type: 'yearly' },
  { attribute: 'commodity_threat_fires_level', type: 'yearly' },
  { attribute: 'commodity_threat_overall_level', type: 'yearly' },
  { attribute: 'commodity_value_forest_extent_level', type: 'yearly' },
  { attribute: 'commodity_value_peat_level', type: 'yearly' },
  { attribute: 'commodity_value_protected_areas_level', type: 'yearly' },
  { attribute: 'commodity_value_overall_level', type: 'yearly' },
];

export default class PalmRiskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewBy: 'amount',
    };
  }

  changeViewBy = (evt) => {
    this.setState({
      viewBy: evt.target.name,
    });
  };

  filterBelow2023 = (ax) => {
    const input = JSON.parse(ax);
    const output = Object.entries(input).reduce((acc, [key, value]) => {
      if (parseInt(key, 10) < 2023) {
        acc[key] = value;
      }
      return acc;
    }, {});
    return JSON.stringify(output);
  };

  getMills = () => {
    const { selectedLocations, filteredData } = this.props;
    if (selectedLocations.length > 1) {
      const filteredLocations = filteredData.filter((location) => {
        return selectedLocations.indexOf(location.location_id) > -1;
      });
      return filteredLocations;
    }
    return [];
  };

  renderAmounts = (mill, idx) => {
    const { viewBy } = this.state;

    const millValues = attributeValues.map((attr, subIdx) => {
      const attributeValue = mill[attr.attribute];
      let millValue;
      let millRisk;
      let value;

      if (attr.type === 'yearly') {
        // Mill Value
        const rowValue = mill[riskValues[subIdx].attribute];
        if (rowValue) {
          value = getLastValue(this.filterBelow2023(rowValue));
        } else {
          value = 0;
        }

        if (
          attr.attribute === 'commodity_mill_priority_level' ||
          attr.attribute === 'commodity_threat_overall_level' ||
          attr.attribute === 'commodity_value_overall_level'
        ) {
          millValue = this.assignRiskPriority(value);
        } else {
          const yearlyData = getLastYear(this.filterBelow2023(attributeValue));
          millValue = Number.isNaN(yearlyData) ? '--' : prettifyNum(formatNum(yearlyData));
        }

        // Mill Risk
        millRisk = this.assignRiskPriority(value);
      } else if (attr.type === 'string') {
        millValue = attributeValue || '';
        millRisk = mill[riskValues[subIdx].attribute] ? mill[riskValues[subIdx].attribute] : '';
      }

      let symbol;
      switch (millRisk) {
        case 'Low':
          symbol = <div className="dotdot low" />;
          break;
        case 'Medium':
          symbol = <div className="dotdot medium" />;
          break;
        case 'High':
          symbol = <div className="dotdot high" />;
          break;
        case 'None':
          symbol = <div className="dotdot none" />;
          break;
        default:
          symbol = <span />;
      }

      return (
        <td
          key={`commodity-${attr.attribute}`}
          className={`risk ${this.assignRiskPriorityClass(millValue)}`}
        >
          {millValue}
          {attr.attribute === 'commodity_threat_deforestation' ||
            attr.attribute === 'commodity_threat_peat' ||
            attr.attribute === 'commodity_threat_protected_areas' ||
            attr.attribute === 'commodity_threat_fires' ||
            attr.attribute === 'commodity_value_forest_extent' ||
            attr.attribute === 'commodity_value_peat' ||
            attr.attribute === 'commodity_value_protected_areas'
            ? symbol
            : null}
        </td>
      );
    });

    // Return the row
    return (
      <tr key={idx} className={`border-bottom ${viewBy === 'amount' ? '' : 'hidden'}`}>
        {millValues}
      </tr>
    );
  };

  renderRisks = (mill, i) => {
    const { viewBy } = this.state;
    const millRisks = riskValues.map((config, j) => {
      let value;
      let label;
      if (config.type === 'yearly') {
        const rowValue = mill[config.attribute];
        if (rowValue) {
          value = getLastValue(this.filterBelow2023(rowValue));
        } else {
          value = 0;
        }
        label = this.assignRiskPriority(value);
      } else if (config.type === 'string') {
        label = mill[config.attribute] ? mill[config.attribute] : '';
      }
      return (
        <td key={`${config.attribute}`} className={`risk ${this.assignRiskPriorityClass(label)}`}>
          {label}
        </td>
      );
    });

    return (
      <tr
        key={i}
        className={`border-bottom mill-row ${i % 2 === 0 ? 'even-mill-row' : 'odd-mill-row'} ${viewBy === 'riskLevel' ? '' : 'hidden'
          }`}
      >
        {millRisks}
      </tr>
    );
  };

  assignRiskPriorityClass = (riskValue) => {
    switch (riskValue) {
      case 'Low':
        return 'low';
      case 'Medium':
        return 'medium';
      case 'High':
        return 'high';
      default:
        return '';
    }
  };

  assignRiskPriority = (riskValue) => {
    const riskList = ['Low', 'Medium', 'High'];

    if (Number.isNaN(riskValue)) {
      return 'None';
    }
    return riskList[riskValue] ?? 'High';
  };

  render() {
    const { listView, selectedLocations } = this.props;
    const { viewBy } = this.state;

    const mills = this.getMills();

    return (
      <Card>
        <CardContent>
          <div
            className={`locations-diagnostics-section-risk ${listView === 'commodity_risk' ? '' : 'hidden'
              } ${selectedLocations.length > 1 ? '' : 'hidden'}`}
          >
            <div
              className={`locations-diagnostics-sub-section-risk palm-risk ${selectedLocations.length > 1 ? '' : 'hidden'
                }`}
            >
              <DiagnosticsChartHeader
                title={'Palm Risk Analysis'}
                informationBubbleId={locationsPage.infoBubbleConfig.crPalmRisk}
                fireDownload={this.props.fireDownload}
                downloadId={'palmRiskAnalysis'}
              />

              <div className="diagnostics-section-title-risk">
                <span className="label">VIEW BY:</span>
                <div className="diagnostics-section-radio-holder">
                  <input
                    type="radio"
                    id="amount-radio"
                    name="amount"
                    value="amount"
                    checked={viewBy === 'amount'}
                    onChange={this.changeViewBy}
                  />
                  <label
                    htmlFor="amount-radio"
                    className="locations-select-type-label radio-button"
                  >
                    Amount
                  </label>
                </div>

                <div className="diagnostics-section-radio-holder">
                  <input
                    type="radio"
                    id="risk-level-radio"
                    name="riskLevel"
                    value={locationsPage.landing.investment}
                    checked={viewBy === 'riskLevel'}
                    onChange={this.changeViewBy}
                  />
                  <label
                    htmlFor="risk-level-radio"
                    className="locations-select-type-label radio-button"
                  >
                    Risk Level
                  </label>
                </div>
              </div>
              <div className="diagnostics-palm-risk__table-container">
                <table className="diagnostics-palm-risk__list-table">
                  <thead>
                    <tr>
                      <th />
                      <th />
                      <th className="table-header__border">
                        <span className="table-header__title">T + V</span>
                      </th>
                      <th colSpan="5" className="table-header__border">
                        <span className="table-header__title">Threats</span>
                      </th>
                      <th colSpan="4" className="table-header__border">
                        <span className="table-header__title">Values</span>
                      </th>
                    </tr>
                    <tr>
                      <th>Site ID</th>
                      <th>Mill Name</th>
                      <th>Mill Priority</th>
                      <th className="fw-400">Deforest.</th>
                      <th className="fw-400">Peat</th>
                      <th className="fw-400">Protected Areas</th>
                      <th className="fw-400">Fire</th>
                      <th>Overall</th>
                      <th className="fw-400">Forest</th>
                      <th className="fw-400">Peat</th>
                      <th className="fw-400">Protected Areas</th>
                      <th>Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mills.map(this.renderAmounts)}
                    {mills.map(this.renderRisks)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

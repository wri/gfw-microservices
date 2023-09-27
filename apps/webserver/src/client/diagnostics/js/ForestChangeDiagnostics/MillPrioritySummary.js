import React, { Component } from 'react';
import {
  locationsPage,
  earliestTreeCoverLossYearCommodityRisk,
  latestTreeCoverLossYearCommodityRisk,
} from '../../../common/js/config';
import IconButtonWrapper from '../../../locations/js/components/IconButtonWrapper';

const lastYear = locationsPage.diagnostics.lastDataYear;

export default class MillPrioritySummary extends Component {
  renderMillTable = () => {
    const { getYearlyData } = this.props;
    const data = getYearlyData(
      'commodity_mill_priority_level',
      earliestTreeCoverLossYearCommodityRisk,
      latestTreeCoverLossYearCommodityRisk,
      true
    );

    const highRows = Object.keys(data).map((year, idx) => {
      return (
        <td
          key={idx}
          className={`locations-mill-data ${data[year] === 2 ? 'high-priority' : ''}`}
        ></td>
      );
    });
    const mediumRows = Object.keys(data).map((year, idx) => {
      return (
        <td
          key={idx}
          className={`locations-mill-data ${data[year] === 1 ? 'medium-priority' : ''}`}
        ></td>
      );
    });
    const lowRows = Object.keys(data).map((year, idx) => {
      return (
        <td
          key={idx}
          className={`locations-mill-data ${data[year] === 0 ? 'low-priority' : ''}`}
        ></td>
      );
    });

    const yearRows = Object.keys(data).map((year, idx) => {
      const value = idx === 0 ? year : `'${year.slice(2)}`;
      return (
        <td key={idx} className="mill-chart__year">
          {value}
        </td>
      );
    });

    highRows.unshift(
      <td key="high-td" className="locations-mill-label high">
        High
      </td>
    );
    mediumRows.unshift(
      <td key="medium-td" className="locations-mill-label medium">
        Medium
      </td>
    );
    lowRows.unshift(
      <td key="low-td" className="locations-mill-label low">
        Low
      </td>
    );
    yearRows.unshift(<td key="blank-td" className="locations-mill-empty"></td>);

    return (
      <tbody>
        <tr key="high-row" className="locations-mill-row">
          {highRows}
        </tr>
        <tr key="medium-row" className="locations-mill-row">
          {mediumRows}
        </tr>
        <tr key="low-row" className="locations-mill-row">
          {lowRows}
        </tr>
        <tr key="year-row" className="locations-mill-row year-row">
          {yearRows}
        </tr>
      </tbody>
    );
  };

  render() {
    const { selectedLocations, getYearlyData, getFilteredLocations, listView } = this.props;
    const filteredLocations = getFilteredLocations();

    let locationName;
    if (filteredLocations && filteredLocations[0]) {
      locationName = filteredLocations[0]['Investment Name'];
    }
    if (filteredLocations && filteredLocations[0] && !locationName) {
      locationName = filteredLocations[0]['Location Name'];
    }

    const millPriority = getYearlyData('commodity_mill_priority_level', lastYear, lastYear)[
      lastYear
    ];
    const overallThreat = getYearlyData('commodity_threat_overall_level', lastYear, lastYear)[
      lastYear
    ];
    const overallValue = getYearlyData('commodity_value_overall_level', lastYear, lastYear)[
      lastYear
    ];

    return (
      <div
        className={`locations-diagnostics-section-risk ${
          listView === 'commodity_risk' && selectedLocations.length === 1 ? '' : 'hidden'
        }`}
      >
        <div
          className={`locations-diagnostics-sub-section-risk mill-summary_table ${
            selectedLocations.length === 1 ? '' : 'hidden'
          }`}
        >
          <div className="subsection-subtitle__container">
            <h4 className="diagnostics-section-title-risk">Mill Priority Summary</h4>
            <span
              onClick={() => this.props.fireDownload('millPriority')}
              className="locations-diagnostics-icon-holder"
            >
              <svg className="svg-icon">
                <use xlinkHref="#icon-download" />
              </svg>
            </span>
          </div>

          <table className="diagnostics-mill__table">
            <tbody>
              <tr>
                <td className="risk">{locationName}</td>
                <td className={`risk ${this.assignRiskPriorityClass(millPriority)}`}>
                  {this.assignRiskPriority(millPriority)}
                </td>
                <td className={`risk ${this.assignRiskPriorityClass(overallThreat)}`}>
                  {this.assignRiskPriority(overallThreat)}
                </td>
                <td className={`risk ${this.assignRiskPriorityClass(overallValue)}`}>
                  {this.assignRiskPriority(overallValue)}
                </td>
              </tr>
              <tr>
                <td className="flex-grid">
                  <span className="text-primary">Mill Name</span>
                </td>
                <td>
                  <span className="text-primary">Mill Priority</span>
                  <br />
                  <span className="text-secondary">Threat + Value</span>
                </td>
                <td>
                  <span className="text-primary">Threat</span>
                  <br />
                  <span className="text-secondary">Overall</span>
                </td>
                <td>
                  <span className="text-primary">Value</span>
                  <br />
                  <span className="text-secondary">Overall</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="locations-diagnostics-sub-section-risk">
          <div className="locations-diagnostics-section-title__container">
            <div className="locations-diagnostics__flex-center subsection-subtitle__container">
              <h4 className="diagnostics-section-title-risk">
                Mill Priority History
                <span className="diagnostics-section-subtitle"> Threat + Value</span>
              </h4>
              <IconButtonWrapper id={locationsPage.infoBubbleConfig.millPriorityHistory} />
            </div>
          </div>
          <div className="locations-diagnostics-chart">
            <table>{this.renderMillTable()}</table>
          </div>
        </div>
      </div>
    );
  }

  assignRiskPriorityClass = (riskValue) => {
    return riskValue === 0 ? 'low' : riskValue === 1 ? 'medium' : 'high';
  };

  assignRiskPriority = (riskValue) => {
    return riskValue === 0 ? 'Low' : riskValue === 1 ? 'Medium' : 'High';
  };
}

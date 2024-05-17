import React, { Component } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { locationsPage, latestTreeCoverLossYearCommodityRisk } from '../../../common/js/config';
import { formatNum, prettifyNum } from '../../../common/js/utils/diagnostics.utils';
import DiagnosticsChartHeader from '../common/DiagnosticsChartHeader';

const lastYear = latestTreeCoverLossYearCommodityRisk;

export default class PalmRiskAnalysis extends Component {
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

    const deforestationThreatAmount = getYearlyData(
      'commodity_threat_deforestation',
      lastYear,
      lastYear
    )[lastYear]; //Threats - Deforestation - Amount
    const peatThreatAmount = getYearlyData('commodity_threat_peat', lastYear, lastYear)[lastYear]; //Threats - Peat - Amount
    const paThreatAmount = getYearlyData('commodity_threat_protected_areas', lastYear, lastYear)[
      lastYear
    ]; //Threats - Protected Areas - Amount
    const firesThreatAmount = getYearlyData('commodity_threat_fires', lastYear, lastYear)[lastYear]; //Threats - Protected Areas - Amount

    const forestValueAmount = getYearlyData('commodity_value_forest_extent', lastYear, lastYear)[
      lastYear
    ]; //Values - Forest - Amount
    const peatValueAmount = getYearlyData('commodity_value_peat', lastYear, lastYear)[lastYear]; //Values - Peat - Amount
    const paValueAmount = getYearlyData('commodity_value_protected_areas', lastYear, lastYear)[
      lastYear
    ]; //Values - Protected Areas - Amount

    const deforestationThreatRisk = getYearlyData(
      'commodity_threat_deforestation_level',
      lastYear,
      lastYear
    )[lastYear]; //Threats - Deforestation - Risk Level
    const peatThreatRisk = getYearlyData('commodity_threat_peat_level', lastYear, lastYear)[
      lastYear
    ]; //Threats - Peat - Risk Level
    const paThreatRisk = getYearlyData(
      'commodity_threat_protected_areas_level',
      lastYear,
      lastYear
    )[lastYear]; //Threats - Protected Areas - Risk Level
    const firesThreatRisk = getYearlyData('commodity_threat_fires_level', lastYear, lastYear)[
      lastYear
    ]; //Threats - Fire - Risk Level

    const forestValueThreat = getYearlyData(
      'commodity_value_forest_extent_level',
      lastYear,
      lastYear
    )[lastYear]; //Values - Forest - Risk Level
    const peatValueThreat = getYearlyData('commodity_value_peat_level', lastYear, lastYear)[
      lastYear
    ]; //Values - Peat - Risk Level
    const paValueThreat = getYearlyData(
      'commodity_value_protected_areas_level',
      lastYear,
      lastYear
    )[lastYear]; //Values - Protected Areas - Risk Level

    return (
      <div
        className={`${listView === 'commodity_risk' ? '' : 'hidden'} ${
          selectedLocations.length === 1 ? '' : 'hidden'
        }`}
      >
        <DiagnosticsChartHeader
          title={'Palm Risk Analysis'}
          informationBubbleId={locationsPage.infoBubbleConfig.crPalmRisk}
          fireDownload={this.props.fireDownload}
          downloadId={'palmRiskAnalysis'}
        />
        <Card>
          <CardContent>
            <div className="locations-diagnostics-section-risk">
              <div className="locations-diagnostics-sub-section-risk palm-risk">
                <table className="diagnostics-palm-risk__table">
                  <thead>
                    <tr>
                      <th />
                      <th className="border-bottom" colSpan="4">
                        Threats
                      </th>
                      <th />
                      <th className="border-bottom" colSpan="3">
                        Values
                      </th>
                    </tr>
                    <tr>
                      <th />
                      <th>Deforestation</th>
                      <th>Peat</th>
                      <th>Protected Areas</th>
                      <th>Fires</th>
                      <th />
                      <th>Forest</th>
                      <th>Peat</th>
                      <th>Protected Areas</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-bottom">
                      <td>Amount</td>
                      <td>
                        <span className="value">
                          {prettifyNum(formatNum(deforestationThreatAmount))}
                        </span>
                        <span className="unit">ha</span>
                      </td>
                      <td>
                        <span className="value">{prettifyNum(formatNum(peatThreatAmount))}</span>
                        <span className="unit">ha</span>
                      </td>
                      <td>
                        <span className="value">{prettifyNum(formatNum(paThreatAmount))}</span>
                        <span className="unit">ha</span>
                      </td>
                      <td>
                        <span className="value">{prettifyNum(formatNum(firesThreatAmount))}</span>
                        <span className="unit">/yr</span>
                      </td>
                      <td />
                      <td>
                        <span className="value">{prettifyNum(formatNum(forestValueAmount))}</span>
                        <span className="unit">ha</span>
                      </td>
                      <td>
                        <span className="value">{prettifyNum(formatNum(peatValueAmount))}</span>
                        <span className="unit">ha</span>
                      </td>
                      <td>
                        <span className="value">{prettifyNum(formatNum(paValueAmount))}</span>
                        <span className="unit">ha</span>
                      </td>
                    </tr>
                    <tr>
                      <td>Risk Level</td>
                      <td
                        className={`risk ${this.assignRiskPriorityClass(deforestationThreatRisk)}`}
                      >
                        {this.assignRiskPriority(deforestationThreatRisk)}
                      </td>
                      <td className={`risk ${this.assignRiskPriorityClass(peatThreatRisk)}`}>
                        {this.assignRiskPriority(peatThreatRisk)}
                      </td>
                      <td className={`risk ${this.assignRiskPriorityClass(paThreatRisk)}`}>
                        {this.assignRiskPriority(paThreatRisk)}
                      </td>
                      <td className={`risk ${this.assignRiskPriorityClass(firesThreatRisk)}`}>
                        {this.assignRiskPriority(firesThreatRisk)}
                      </td>
                      <td />
                      <td className={`risk ${this.assignRiskPriorityClass(forestValueThreat)}`}>
                        {this.assignRiskPriority(forestValueThreat)}
                      </td>
                      <td className={`risk ${this.assignRiskPriorityClass(peatValueThreat)}`}>
                        {this.assignRiskPriority(peatValueThreat)}
                      </td>
                      <td className={`risk ${this.assignRiskPriorityClass(paValueThreat)}`}>
                        {this.assignRiskPriority(paValueThreat)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
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

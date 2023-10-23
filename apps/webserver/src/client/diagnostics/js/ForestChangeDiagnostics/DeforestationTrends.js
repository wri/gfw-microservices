import React, { Component } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Highcharts from 'highcharts';
import { formatNum, prettifyNum } from '../../../common/js/utils/diagnostics.utils';
import DiagnosticsChartHeader from '../common/DiagnosticsChartHeader';
import {
  locationsPage,
  earliestTreeCoverLossYearCommodityRisk,
  latestTreeCoverLossYearCommodityRisk,
} from '../../../common/js/config';

export default class DeforestationTrends extends Component {
  componentDidMount() {
    this.renderChart(this.refs.deforestationChart);
  }

  renderChart = (el) => {
    const { getYearlyData, getYearlyHighchartSeries } = this.props;
    const series = [];

    series.push({
      name: 'Tree Cover Loss',
      data: getYearlyHighchartSeries(
        getYearlyData(
          'commodity_threat_deforestation',
          earliestTreeCoverLossYearCommodityRisk,
          latestTreeCoverLossYearCommodityRisk
        )
      ),
      color: '#ef669a',
      groupPadding: 0,
      showInLegend: false,
    });

    const chart = new Highcharts.chart({
      chart: {
        renderTo: el,
        type: 'column',
        height: 200,
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'category',
        crosshair: true,
        title: {
          useHTML: true,
          text: '<div class="DeforestationTrends__hc-xAxis--title">Years</div>',
        },
        labels: {
          formatter: function () {
            return this.isFirst ? this.value : `'${this.value.slice(-2)}`;
          },
          rotation: 0,
        },
      },
      yAxis: {
        min: 0,
        title: {
          useHTML: true,
          text: '<div class="DeforestationTrends__hc-yAxis--title">LOSS<br/><span style="font-weight:300">(thousand ha)</span></div>',
        },
      },
      tooltip: {
        headerFormat: '<table>',
        pointFormatter: function () {
          return `<tr><td style="color:${this.color};padding:0">${
            this.series.name
          }: </td><td style="padding-top:0; padding-bottom: 0"><b>${prettifyNum(
            formatNum(this.y)
          )} ha</b></td></tr>`;
        },
        footerFormat: '</table><span style="font-size:10px">in {point.key}</span>',
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: series,
      credits: {
        enabled: false,
      },
    });

    return chart;
  };

  render() {
    const { selectedLocations, getFilteredLocations } = this.props;

    const filteredLocations = getFilteredLocations();
    const [location] = filteredLocations;

    const supplierName = location && location['Supplier Name'] ? location['Supplier Name'] : '';
    const supplierNameTwo =
      location && location['Second Supplier Name'] ? location['Second Supplier Name'] : '';
    const parentCompany = location && location['Parent Company'] ? location['Parent Company'] : '';
    const certified = location && location.Certification === 'RSPO' ? 'Yes' : 'No';

    return (
      <Card style={{ marginTop: '30px', marginBottom: '30px' }}>
        <CardContent>
          <div className="locations-diagnostics-section-risk">
            <div
              className={`locations-diagnostics-sub-section-risk deforestation__table ${
                selectedLocations.length === 1 ? '' : 'hidden'
              }`}
            >
              <DiagnosticsChartHeader title={'Location Details'} />
              <table className="diagnostics-deforestation__table">
                <thead>
                  <tr>
                    <th>{supplierName ? supplierName : '--'}</th>
                    <th>{supplierNameTwo ? supplierNameTwo : '--'}</th>
                    <th>{parentCompany ? parentCompany : '--'}</th>
                    <th>{certified}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Supplier Name 1</td>
                    <td>Supplier Name 2</td>
                    <td>Parent Company</td>
                    <td>RSPO Certified</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="locations-diagnostics-sub-section-risk">
              <div className="locations-diagnostics-section-title__container">
                <DiagnosticsChartHeader
                  title={'Trends in Deforestation'}
                  informationBubbleId={locationsPage.infoBubbleConfig.trendsDeforestation}
                  fireDownload={this.props.fireDownload}
                  downloadId={'deforestationTrends'}
                />
              </div>
              <div className="locations-diagnostics-chart">
                <div ref="deforestationChart" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
}

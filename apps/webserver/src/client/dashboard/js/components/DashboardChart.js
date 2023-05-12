import React, { Component } from 'react';
import isEqual from 'lodash/isEqual';
import Highcharts from 'highcharts';
import moment from 'moment';

import dictionary from '../utils/dictionary';
import { prettifyNum } from '../../../locations/js/utils/diagnostics.utils';
import {
  getSelectedTimeframeStartEndGroupings,
  isInDaysOfWeek,
  isInMonthsOfQuarter,
  isInMonthsOfYear,
} from '../utils/dashboard-date.utils';

import '../../css/_dashboardChart.scss';

const DATE_FORMAT = 'DD MMM YYYY';

export default class DashboardChart extends Component {
  componentDidMount() {
    this.updateChart(this.refs.alertHistoryHighchart);
  }

  componentDidUpdate(prevProps) {
    // We only update the chart if certain options are changed.
    const newTimeframeSelected = !isEqual(prevProps.selectedTimeframe, this.props.selectedTimeframe);
    const newAlertTypeSelected = !isEqual(prevProps.selectedAlert, this.props.selectedAlert);
    const newData = !isEqual(prevProps.filteredLocationGeoJSON, this.props.filteredLocationGeoJSON);
    if (newTimeframeSelected || newAlertTypeSelected || newData) {
      this.updateChart(this.refs.alertHistoryHighchart);
    }
  }

  updateChart(node) {
    const { selectedTimeframe } = this.props;
    const data = this.getChartSeries();

    const categories = data.map((point) => point.name);

    const series = [
      {
        name: 'Alerts',
        data: data,
        color: '#096121',
        groupPadding: 0,
        showInLegend: false,
      },
    ];

    const chart = new Highcharts.chart({
      chart: {
        renderTo: node,
        type: 'column',
      },
      title: {
        text: '',
      },
      tooltip: {
        formatter: function () {
          const { key, y } = this;
          const [start] = key.split(' - ');
          const serieName =
            selectedTimeframe === 'QUARTER' || selectedTimeframe === 'YEAR'
              ? moment(start, DATE_FORMAT).format('MMMM')
              : key;
          return `<b>${serieName}</b><br/>Alerts: <b>${prettifyNum(y)}</b>`;
        },
      },
      xAxis: {
        type: 'category',
        categories: categories,
        crosshair: true,
        title: {
          text: '',
        },
        labels: {
          formatter: function () {
            const { value } = this;
            const [start] = value.split(' - ');
            switch (selectedTimeframe) {
              case 'QUARTER':
              case 'YEAR':
                return moment(start, DATE_FORMAT).format('MMM')[0];
              case 'WEEK':
                return start;
              default:
                return value;
            }
          },
          padding: 1,
        },
      },
      yAxis: {
        min: 0,
        title: {
          useHTML: true,
          text: '<div class="DashboardChart__hc-yAxis--title"># of Alerts</div>',
        },
      },
      plotOptions: {
        series: {
          stacking: 'normal',
        },
        column: {
          stacking: 'normal',
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
  }

  getChartSeries() {
    const { selectedTimeframe, selectedAlert, filteredDissolvedGeoJSON } = this.props;
    // Property accessors
    const selectedAlertProperty = dictionary.alertType_featureTimeframeProperty[selectedAlert];
    // Only care about the specific feature property
    const locationAlertsArray = filteredDissolvedGeoJSON.features.map(
      (feature) => feature.properties[selectedAlertProperty]
    );

    // Create 2D array of dates for the Highchart (filling in no data periods)
    const array = getSelectedTimeframeStartEndGroupings(selectedTimeframe);

    // Create the series for GLAD
    if (selectedAlert === 'GLAD') {
      return array.map((period, idx) => {
        const mStart = moment(period[0], DATE_FORMAT);
        const mEnd = moment(period[1], DATE_FORMAT);
        const serieName = `${mStart.format(DATE_FORMAT)} - ${mEnd.format(DATE_FORMAT)}`;
        let total = 0;

        // Calculating total based on start, end dates and selected period
        if (selectedTimeframe === 'WEEK') {
          const alertsWithinTime = filteredDissolvedGeoJSON.features
            .map((l) => l.properties.glad_alerts_daily)
            .flat()
            .filter((f) => {
              return isInDaysOfWeek(idx, f.day);
            });
          total = alertsWithinTime.reduce((acc, curr) => acc + curr.count, 0);
        }
        if (selectedTimeframe === 'MONTH') {
          //Calc alerts within a month timeframe using ISO weeks. We take current week, eg: ISO 40, and determine 4 last ISO weeks, so it would be [39, 38, 37, 36]. Then we take all alerts within those weeks and sum them up.
          const startOfTimeframe = period[0];
          const ISOPeriod = moment(startOfTimeframe, DATE_FORMAT).format('YYYY-WW');

          const alertsWithinTime = filteredDissolvedGeoJSON.features
            .map((l) => l.properties.glad_alerts_weekly)
            .flat()
            .filter((f) => f.day === ISOPeriod);

          total = alertsWithinTime.reduce((acc, curr) => acc + curr.count, 0);
        }
        if (selectedTimeframe === 'QUARTER' || selectedTimeframe === 'YEAR') {
          const alertsWithinTime = filteredDissolvedGeoJSON.features
            .map((l) => l.properties.glad_alerts_monthly)
            .flat()
            .filter((f) => {
              return selectedTimeframe === 'QUARTER' ? isInMonthsOfQuarter(idx, f.day) : isInMonthsOfYear(idx, f.day);
            });
          total = alertsWithinTime.reduce((acc, curr) => acc + curr.count, 0);
        }

        return {
          name: serieName,
          x: idx,
          y: total,
        };
      });
    }

    // Create the series for VIIRS/FIRES
    return array.map((period, idx) => {
      const mStart = moment(period[0], DATE_FORMAT);
      const mEnd = moment(period[1], DATE_FORMAT);
      const serieName = `${mStart.format(DATE_FORMAT)} - ${mEnd.format(DATE_FORMAT)}`;

      let total = 0;
      locationAlertsArray.forEach((alertObj) => {
        Object.entries(alertObj).forEach((timeframe) => {
          const [p, periodData] = timeframe;
          const periodMoment = moment(p);
          if (periodMoment.isSameOrAfter(mStart) && periodMoment.isSameOrBefore(mEnd)) {
            const periodTotal = periodData.reduce((a, c) => a + c.count, 0);
            total = total + periodTotal;
          }
        });
      });

      return {
        name: serieName,
        x: idx,
        y: total,
      };
    });
  }

  render() {
    return <div className="chart DashboardChart" ref="alertHistoryHighchart" />;
  }
}

import React, { useEffect } from 'react';
import Highcharts from 'highcharts';
import { getFormatedTooltipForDiagnosticsChart } from '../../../common/js/utils/diagnostics.utils';
import useHookWithRefCallback from './useHookWithRefCallback';

function BarChart({ data, plotBands = [], plotLines = [] }) {
  const renderChart = (divRef) => {
    Highcharts.chart({
      chart: {
        marginBottom: 100,
        renderTo: divRef,
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        type: 'column',
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'category',
        crosshair: true,
        title: {
          useHTML: true,
          text: '<div>Years</div>',
        },
        plotBands,
        plotLines,
        labels: {
          formatter() {
            return `'${this.value.toString().substr(-2)}`; // displays the last two digits of the year
          },
        },
      },
      yAxis: {
        min: 0,
        title: {
          useHTML: true,
          text: '<div>ha</div>',
        },
      },
      tooltip: {
        headerFormat: '<table>',
        pointFormatter() {
          return getFormatedTooltipForDiagnosticsChart.call(this);
        },
        footerFormat: '</table><span style="font-size:10px">in {point.key}</span>',
        shared: true,
        useHTML: true,
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
      series: data,
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    });
  };

  const [ref] = useHookWithRefCallback(renderChart);

  useEffect(() => {
    if (ref.current && data) {
      renderChart(ref.current);
    }
  }, [data]); // Re-run effect when data changes

  return <div data-testid="bar-chart" ref={ref} />;
}

export default BarChart;

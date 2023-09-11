import React from 'react';
import Highcharts from 'highcharts';
import useHookWithRefCallback from '../../ForestChangeDiagnostics/OtbnCharts/OtbnAreaChart/useHookWithRefCallback';
import { eudrDiagnosticsChartsColors } from '../eudrDiagnosticsChartsColors.constants';

function EudrDiagnosticsChart({ data }) {
  const formattedData = data.map(({ id, category, coverage }) => ({
    name: category,
    y: coverage,
    color: eudrDiagnosticsChartsColors[id],
  }));
  const renderChart = (divRef) => {
    Highcharts.chart({
      chart: {
        renderTo: divRef,
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        type: 'pie',
        animation: false,
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        pointFormat: '{point.percentage:.1f} %',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>:<br>{point.percentage:.1f} %',
          },
        },
      },
      series: [
        {
          colorByPoint: true,
          data: formattedData,
        },
      ],
    });
  };

  const [ref] = useHookWithRefCallback(renderChart);

  return <div ref={ref} />;
}

export default EudrDiagnosticsChart;

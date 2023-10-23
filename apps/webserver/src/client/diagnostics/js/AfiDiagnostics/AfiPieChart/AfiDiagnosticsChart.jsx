import React from 'react';
import Highcharts from 'highcharts';
import useHookWithRefCallback from '../../common/useHookWithRefCallback';
import { afiDiagnosticsChartsColors } from '../afiDiagnosticsChartsColors.constants';

function AfiDiagnosticsChart({ data }) {
  const formattedData = data?.map(({ id, category, coverage }) => ({
    name: category,
    y: coverage,
    color: afiDiagnosticsChartsColors[id],
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

export default AfiDiagnosticsChart;

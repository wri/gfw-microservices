import React from 'react';
import Highcharts from 'highcharts';
import useHookWithRefCallback from '../../../common/useHookWithRefCallback';
import { chartDatasetConfigs } from '../../SouthAmericaRegions/regions.constants';

function Chart({ data }) {
  const renderChart = (divRef) => {
    const argentinaOtbnArea = JSON.parse(data?.arg_otbn_area);
    const { argentinaOtbn } = chartDatasetConfigs;
    const chartData = argentinaOtbn.chartLabels.map(({ legend, color }) => ({
      legend,
      y: argentinaOtbnArea[legend],
      color,
    }));

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
        pointFormat: '{point.y}<br>{point.percentage:.1f} %',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.legend}</b>:<br>{point.y}<br>{point.percentage:.1f} %',
          },
        },
      },
      series: [
        {
          colorByPoint: true,
          data: chartData,
        },
      ],
    });
  };

  const [ref] = useHookWithRefCallback(renderChart);

  return <div ref={ref} />;
}

export default Chart;

import React from 'react';
import Highcharts from 'highcharts';
import useHookWithRefCallback from '../../../common/useHookWithRefCallback';
import { chartDatasetConfigs } from '../../SouthAmericaRegions/regions.constants';

function Chart({ data }) {
  const renderChart = (divRef) => {
    const argentinaOtbnArea = JSON.parse(data?.arg_otbn_area);
    const { argentinaCompliance } = chartDatasetConfigs;
    const chartData = argentinaCompliance.categories.map(({ name, color }) => ({
      name,
      y: argentinaOtbnArea[name],
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
            format: '<b>{point.name}</b>:<br>{point.y}<br>{point.percentage:.1f} %',
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

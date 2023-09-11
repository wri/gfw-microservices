import React from 'react';
import Highcharts from 'highcharts';
import useHookWithRefCallback from './useHookWithRefCallback';
import { otbnChartsColors } from '../OtbnChartsColors.constants';

function Chart({ data }) {
  const renderChart = (divRef) => {
    const argentinaOtbnArea = JSON.parse(data?.arg_otbn_area);

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
          data: [
            {
              name: 'Category I',
              y: argentinaOtbnArea['Category I'],
              color: otbnChartsColors['Category I'],
            },
            {
              name: 'Category II',
              y: argentinaOtbnArea['Category II'],
              color: otbnChartsColors['Category II'],
            },
            {
              name: 'Category III',
              y: argentinaOtbnArea['Category III'],
              color: otbnChartsColors['Category III'],
            },
          ],
        },
      ],
    });
  };

  const [ref] = useHookWithRefCallback(renderChart);

  return <div ref={ref} />;
}

export default Chart;

import React from 'react';
import Highcharts from 'highcharts';
import useHookWithRefCallback from '../useHookWithRefCallback';

const transifex = Transifex.live.translateText;

function Chart({ data, chartLabels, hasSubLayers }) {
  const pieChartsData = [];

  let dataLabels = {
    format: '<b>{point.name}</b>:<br>{point.percentage:.2f} %',
  };

  if (hasSubLayers) {
    dataLabels = {
      distance: -50,
      format: '<b>{point.name}</b>:<br>{point.percentage:.2f} %',
      color: '#000',
      filter: {
        property: 'percentage',
        operator: '>',
        value: 10,
      },
    };
  }

  const categoriesData = {
    colorByPoint: true,
    data: [],
    size: hasSubLayers ? '60%' : null,
  };

  const subLayersData = {
    name: 'subLayers',
    data: [],
    size: '100%',
    innerSize: '60%',
    dataLabels: {
      distance: 5,
      filter: {
        property: 'percentage',
        operator: '>',
        value: 3,
      },
      style: {
        fontWeight: 'normal',
      },
    },
    id: 'versions',
  };

  chartLabels.forEach(({ id, legend, color, subLayerColor }) => {
    let category;
    let sumOfSubLayers = 0;

    if (hasSubLayers && data[id]) {
      Object.entries(data[id]).forEach(([key, value]) => {
        sumOfSubLayers += value;

        subLayersData.data.push({
          name: transifex(key),
          y: value,
          color: subLayerColor,
        });
      });
    }

    category = {
      name: transifex(legend),
      y: hasSubLayers ? sumOfSubLayers : data[id],
      color,
    };

    categoriesData.data.push(category);
  });

  pieChartsData.push(categoriesData);

  if (hasSubLayers) {
    pieChartsData.push(subLayersData);
  }

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
        pointFormat: '{point.percentage:.2f} %',
      },
      plotOptions: {
        pie: {
          allowPointSelect: !hasSubLayers,
          cursor: 'pointer',
          dataLabels,
        },
      },
      series: [...pieChartsData],
    });
  };

  const [ref] = useHookWithRefCallback(renderChart);

  return <div ref={ref} />;
}

export default Chart;

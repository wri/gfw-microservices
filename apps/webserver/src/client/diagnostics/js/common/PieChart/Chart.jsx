import React from 'react';
import Highcharts from 'highcharts';
import useHookWithRefCallback from '../useHookWithRefCallback';

const transifex = Transifex.live.translateText;

function Chart({ data, chartLabels, hideChartLabels, hasSubcategories }) {
  const pieChartsData = [];

  let dataLabels = {
    enabled: !hideChartLabels,
    format: '<b>{point.name}</b>:<br>{point.percentage:.1f} %',
  };

  if (hasSubcategories) {
    dataLabels = {
      enabled: true,
      distance: -40,
      format: '{point.percentage:.1f} %',

      color: '#FF00FF',

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
    size: hasSubcategories ? '50%' : null,
  };

  const subCategoriesData = {
    name: 'subCategories',
    data: [],
    size: '100%',
    innerSize: '50%',
    dataLabels: {
      distance: -40,
      format: '{point.percentage:.1f} %',
      filter: {
        property: 'percentage',
        operator: '>',
        value: 5,
      },
      style: {
        fontWeight: 'normal',
      },
    },
    id: 'versions',
  };

  chartLabels.forEach(({ id, legend, color, subCategoryColor }) => {
    let category;
    if (hasSubcategories) {
      let sumOfSubcategories = 0;

      if (data[id]) {
        Object.entries(data[id]).forEach(([key, value]) => {
          sumOfSubcategories += value;

          subCategoriesData.data.push({
            name: transifex(key),
            y: value,
            color: subCategoryColor,
          });
        });
      }

      category = {
        name: transifex(legend),
        y: sumOfSubcategories,
        color,
      };
    } else {
      category = {
        name: transifex(legend),
        y: data[id],
        color,
      };
    }

    categoriesData.data.push(category);
  });

  pieChartsData.push(categoriesData);

  if (hasSubcategories) {
    pieChartsData.push(subCategoriesData);
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
        pointFormat: hasSubcategories ? '{point.y:.2f}' : '{point.y}<br>{point.percentage:.1f} %',
      },
      plotOptions: {
        pie: {
          allowPointSelect: !hasSubcategories,
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

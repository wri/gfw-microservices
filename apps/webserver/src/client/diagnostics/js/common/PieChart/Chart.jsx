import React from 'react';
import Highcharts from 'highcharts';
import useHookWithRefCallback from '../useHookWithRefCallback';

const transifex = Transifex.live.translateText;

function Chart({ data, chartLabels, hasSubcategories }) {
  const pieChartsData = [];

  let dataLabels = {
    format: '<b>{point.name}</b>:<br>{point.percentage:.2f} %',
  };

  if (hasSubcategories) {
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
    size: hasSubcategories ? '60%' : null,
  };

  const subCategoriesData = {
    name: 'subCategories',
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

  chartLabels.forEach(({ id, legend, color, subCategoryColor }) => {
    let category;
    let sumOfSubcategories = 0;

    if (hasSubcategories && data[id]) {
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
      y: hasSubcategories ? sumOfSubcategories : data[id],
      color,
    };

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
        pointFormat: '{point.percentage:.2f} %',
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

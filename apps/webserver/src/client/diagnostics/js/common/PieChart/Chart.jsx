import Highcharts from 'highcharts';
import useHookWithRefCallback from '../useHookWithRefCallback';

const transifex = (text) => window.Transifex?.live?.translateText?.(text) ?? text;

function Chart({ data, chartLabels, hasSecondarySubLayers }) {
  const subLayersData = [];
  const secondarySubLayersData = [];

  for (const chartLabel of chartLabels) {
    const { id, legend, color, subLayerColor } = chartLabel;

    let sumOfSubLayers = 0;

    if (hasSecondarySubLayers && data[id]) {
      Object.entries(data[id]).forEach(([key, value]) => {
        sumOfSubLayers += value;

        secondarySubLayersData.push({
          name: transifex(key),
          y: value,
          color: subLayerColor,
        });
      });
    }

    subLayersData.push({
      name: transifex(legend),
      y: hasSecondarySubLayers ? sumOfSubLayers : data[id],
      color,
    });
  }

  const series = [
    {
      name: 'SubLayers',
      data: subLayersData,
      colorByPoint: true,
      color: '#000',
      size: hasSecondarySubLayers ? '60%' : null,
      dataLabels: {
        distance: hasSecondarySubLayers ? '-50%' : '5%',
        format: hasSecondarySubLayers ? null : '<b>{point.name}</b>:<br>{point.percentage:.2f} %',
        filter: {
          property: 'percentage',
          operator: '>',
          value: 1,
        },
      },
    },
  ];

  if (hasSecondarySubLayers) {
    series.push({
      name: 'SecondarySubLayers',
      data: secondarySubLayersData,
      size: '100%',
      innerSize: '60%',
      dataLabels: {
        distance: 1,
        format: '<b>{point.name}</b>: {point.percentage:.2f} %',
        filter: {
          property: 'percentage',
          operator: '>',
          value: 1,
        },
        style: {
          fontWeight: 'normal',
        },
      },
    });
  }

  const renderChart = (divRef) => {
    Highcharts.chart({
      chart: {
        renderTo: divRef,
        type: 'pie',
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        animation: false,
        marginLeft: 100,
        marginRight: 100,
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
          allowPointSelect: !hasSecondarySubLayers,
          cursor: 'pointer',
          center: ['50%', '50%'],

          dataLabels: {
            crop: false,
            style: {
              fontSize: '0.5625rem',
            },
            useHTML: true,
          },
        },
      },
      series,
    });
  };

  const [ref] = useHookWithRefCallback(renderChart);

  return <div ref={ref} />;
}

export default Chart;

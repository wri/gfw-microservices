import Highcharts from 'highcharts';
import useHookWithRefCallback from '../../common/useHookWithRefCallback';
import { afiDiagnosticsChartsColors } from '../afiDiagnosticsChartsColors.constants';

const transifex = Transifex.live.translateText;

function AfiDiagnosticsChart({ data }) {
  const formattedData = Array.isArray(data)
    ? data.map(({ id, category, coverage }) => ({
        name: transifex(category),
        y: coverage,
        color: afiDiagnosticsChartsColors[id],
      }))
    : [];
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
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>:<br>{point.percentage:.2f} %',
            filter: {
              property: 'percentage',
              operator: '>',
              value: 1,
            },
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

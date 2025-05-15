import { useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const transifex = Transifex.live.translateText;

import Highcharts from 'highcharts';
import useHookWithRefCallback from './useHookWithRefCallback';
import { BarCharTooltip } from './BarChartTooltip';

export default function BarChart({
  data,
  plotBands = [],
  plotLines = [],
  columnStackStyle,
  yAxisTitleText = 'ha',
  rawBarChartData,
  isDataWithTwoLevelsOfCategory = false,
}) {
  const renderChart = (divRef) => {
    Highcharts.chart({
      chart: {
        marginBottom: 100,
        renderTo: divRef,
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        type: 'column',
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'category',
        crosshair: true,
        title: {
          useHTML: true,
          text: `<div>${transifex('Years')}</div>`,
        },
        plotBands,
        plotLines,
        labels: {
          formatter() {
            return `'${this.value.toString().slice(-2)}`; // displays the last two digits of the year
          },
        },
      },
      yAxis: {
        min: 0,
        title: {
          useHTML: true,
          text: `<div>${yAxisTitleText}</div>`,
        },
      },
      tooltip: {
        headerFormat: '<table>',
        pointFormatter() {
          return renderToStaticMarkup(
            <BarCharTooltip
              {...this}
              rawBarChartData={rawBarChartData}
              isDataWithTwoLevelsOfCategory={isDataWithTwoLevelsOfCategory}
            />
          );
        },
        footerFormat: '</table><span style="font-size:10px">in {point.key}</span>',
        shared: true,
        useHTML: true,
      },
      plotOptions: {
        series: {
          stacking: 'normal',
        },
        column: {
          stacking: columnStackStyle,
          pointPadding: 0.2,
          borderWidth: 0,
        },
      },
      series: data,
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    });
  };

  const [ref] = useHookWithRefCallback(renderChart);

  useEffect(() => {
    if (ref.current && data) {
      renderChart(ref.current);
    }
  }, [data]); // Re-run effect when data changes

  return <div data-testid="bar-chart" ref={ref} />;
}

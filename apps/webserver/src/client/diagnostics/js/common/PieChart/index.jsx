import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chart from './Chart';
import Table from './Table';
import DiagnosticsChartHeader from '../DiagnosticsChartHeader';
import '../DiagnosticsChartContainer.scss';
import { SelectorWithTwoLevels } from '../../ForestChangeDiagnostics/SouthAmericaRegions/SelectorWithTwoLevels';

function PieChart({
  data,
  chartLabels,
  title,
  informationBubbleId,
  preview = false,
  hasSecondarySubLayers,
}) {
  const chartLabel = hasSecondarySubLayers ? chartLabels?.subLayers : chartLabels;

  const sumOfAreasByChartLabel = chartLabel?.reduce((sum, { id }) => sum + (data?.[id] || 0), 0);

  if (!sumOfAreasByChartLabel && !hasSecondarySubLayers) {
    return <></>;
  }

  return (
    <>
      <DiagnosticsChartHeader
        title={title}
        informationBubbleId={informationBubbleId}
        preview={preview}
      />
      <Card>
        <CardContent>
          <div className="diagnostics-chart-container" data-testid="pie-chart">
            <div className="diagnostics-chart-container__chart">
              <Chart
                data={data}
                chartLabels={chartLabel}
                hasSecondarySubLayers={hasSecondarySubLayers}
              />
            </div>
            {hasSecondarySubLayers ? (
              <div className="chart-legends-table">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Coverage (%)</th>
                      <th className="label right">Total area (HA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SelectorWithTwoLevels {...selectorWithTwoLevelsAdapter(data, chartLabels)} />
                  </tbody>
                </table>
              </div>
            ) : (
              <Table
                data={data}
                chartLabels={chartLabels}
                sumOfAreasByChartLabel={sumOfAreasByChartLabel}
                preview={preview}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

const selectorWithTwoLevelsAdapter = (data, chartLabels) => {
  const dataPathArray = chartLabels.dataPath.split('.');

  let adaptedData = {};
  for (let i = 0; i < dataPathArray.length; i++) {
    if (i === dataPathArray.length - 1) {
      adaptedData[dataPathArray[i - 1]] = { [dataPathArray[i]]: data };
    } else {
      adaptedData[dataPathArray[i]] = {};
    }
  }

  return { data: adaptedData, chartConfiguration: chartLabels, selectedOptionId: chartLabels.id };
};

export default PieChart;

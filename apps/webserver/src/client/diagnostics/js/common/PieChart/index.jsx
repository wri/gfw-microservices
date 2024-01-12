import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chart from './Chart';
import Table from './Table';
import DiagnosticsChartHeader from '../DiagnosticsChartHeader';
import '../DiagnosticsChartContainer.scss';

function PieChart({ data, chartLabels, title, informationBubbleId }) {
  const sumOfAreasByChartLabel = chartLabels.reduce((sum, { id }) => sum + (data[id] || 0), 0);
  return (
    !!sumOfAreasByChartLabel && ( // don't display the chart if the total area is 0
      <>
        <DiagnosticsChartHeader title={title} informationBubbleId={informationBubbleId} />
        <Card>
          <CardContent>
            <div className="diagnostics-chart-container" data-testid="pie-chart">
              <div className="diagnostics-chart-container__chart">
                <Chart data={data} chartLabels={chartLabels} />
              </div>
              <Table
                title={title}
                data={data}
                chartLabels={chartLabels}
                sumOfAreasByChartLabel={sumOfAreasByChartLabel}
              />
            </div>
          </CardContent>
        </Card>
      </>
    )
  );
}

export default PieChart;

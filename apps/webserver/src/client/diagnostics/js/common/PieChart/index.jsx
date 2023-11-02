import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chart from './Chart';
import Table from './Table';
import DiagnosticsChartHeader from '../DiagnosticsChartHeader';
import '../DiagnosticsChartContainer.scss';

function PieChart({ data, chartLabels, title, informationBubbleId }) {
  return (
    <>
      <DiagnosticsChartHeader title={title} informationBubbleId={informationBubbleId} />
      <Card>
        <CardContent>
          <div className="diagnostics-chart-container">
            <div className="diagnostics-chart-container__chart">
              <Chart data={data} chartLabels={chartLabels} />
            </div>
            <Table title={title} data={data} chartLabels={chartLabels} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default PieChart;

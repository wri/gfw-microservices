import React from 'react';
import Table from './Table';
import AfiDiagnosticsChart from './AfiDiagnosticsChart';
import './ChartContainer.scss';

function AfiPieChart({ data }) {
  return (
    <div className="chart-container">
      <div className="chart-container__pie-chart">
        <AfiDiagnosticsChart data={data} />
      </div>
      <Table data={data} />
    </div>
  );
}

export default AfiPieChart;

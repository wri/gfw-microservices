import React from 'react';
import Table from './Table';
import EudrDiagnosticsChart from './EudrDiagnosticsChart';
import './ChartContainer.scss';

function EudrPieChart({ data }) {
  return (
    <div className="chart-container">
      <div className="chart-container__pie-chart">
        <EudrDiagnosticsChart data={data} />
      </div>
      <Table data={data} />
    </div>
  );
}

export default EudrPieChart;

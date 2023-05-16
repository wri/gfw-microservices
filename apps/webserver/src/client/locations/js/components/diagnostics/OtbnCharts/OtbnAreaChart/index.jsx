import React from 'react';
import Chart from './Chart';
import Table from './Table';
import './OtbnChartContainer.scss';

function OtbnAreaChart({ data }) {
  return (
    <div className="otbn-chart-container">
      <div className="otbn-pie-chart">
        <div className="subsection-subtitle">ARGENTINA OTBN OVERLAP</div>
        <Chart data={data} />
      </div>
      <Table data={data} />
    </div>
  );
}

export default OtbnAreaChart;

import React from 'react';
import Chart from './Chart';
import Table from './Table';
import './OtbnChartContainer.scss';

function OtbnAreaChart({ data }) {
  return (
    <div className="otbn-chart-container">
      <Chart data={data} />
      <Table data={data} />
    </div>
  );
}

export default OtbnAreaChart;

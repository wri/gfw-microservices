import React from 'react';
import { prettifyNum, formatNum, formatPct } from '../../../../common/js/utils/diagnostics.utils';
import './ChartLegendsTable.scss';

function Table({ data, chartLabels, sumOfAreasByChartLabel }) {
  const chartLabelRows = chartLabels.map(({ id, legend, color }) => {
    const chartLabelArea = data[id] || 0;
    const chartLabelPercentage = (chartLabelArea / sumOfAreasByChartLabel) * 100;
    return (
      <tr key={id}>
        <td>
          <span className="chart-legends-table__checkbox" style={{ background: color }} />
          <label htmlFor={`pie-chart-label-${id}`}>{legend}</label>
        </td>
        <td>{formatPct(chartLabelPercentage)}</td>
        <td>{prettifyNum(formatNum(chartLabelArea))}</td>
      </tr>
    );
  });

  return (
    <div className="chart-legends-table">
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>COVERAGE (%)</th>
            <th>TOTAL AREA (HA)</th>
          </tr>
        </thead>
        <tbody>{chartLabelRows}</tbody>
      </table>
    </div>
  );
}

export default Table;

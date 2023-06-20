import React from 'react';
import { otbnChartsColors, otbnCategories } from '../OtbnChartsColors.constants';
import { prettifyNum, formatNum, formatPct } from '../../../../utils/diagnostics.utils';
import './OtbnTable.scss';

function Table({ data }) {
  const argentinaOtbnArea = JSON.parse(data?.arg_otbn_area);
  const categoryIArea = argentinaOtbnArea['Category I'] || 0
  const categoryIIArea = argentinaOtbnArea['Category II'] || 0;
  const categoryIIIArea = argentinaOtbnArea['Category III'] || 0;
  const totalArea = categoryIArea + categoryIIArea + categoryIIIArea;

  const categoryRows = otbnCategories.map((category) => {
    const categoryArea = argentinaOtbnArea[category] || 0;
    const categoryPercentage = (categoryArea / totalArea) * 100;
    return (
      <tr key={category}>
        <td>
          <span className="otbn-checkbox" style={{ background: otbnChartsColors[category] }} />
          <label htmlFor="pie-chart-category-2">{category}</label>
        </td>
        <td>{formatPct(categoryPercentage)}</td>
        <td>{prettifyNum(formatNum(categoryArea))}</td>
      </tr>
    );
  });

  return (
    <div className="otbn-table">
      <table>
        <thead>
          <tr>
            <th>ARGENTINA OTBN OVERLAP</th>
            <th>COVERAGE (%)</th>
            <th>TOTAL AREA (HA)</th>
          </tr>
        </thead>
        <tbody>{categoryRows}</tbody>
      </table>
    </div>
  );
}

export default Table;

import React from 'react';
import { chartDatasetConfigs } from '../../SouthAmericaRegions/regions.constants';
import {
  prettifyNum,
  formatNum,
  formatPct,
} from '../../../../../common/js/utils/diagnostics.utils';
import './OtbnTable.scss';

function Table({ data }) {
  const { argentinaCompliance } = chartDatasetConfigs;

  const argentinaOtbnArea = JSON.parse(data?.arg_otbn_area);
  const categoryIArea = argentinaOtbnArea['Category I'] || 0;
  const categoryIIArea = argentinaOtbnArea['Category II'] || 0;
  const categoryIIIArea = argentinaOtbnArea['Category III'] || 0;
  const totalArea = categoryIArea + categoryIIArea + categoryIIIArea;

  const categoryRows = argentinaCompliance.categories.map(({ id, name, color }) => {
    const categoryArea = argentinaOtbnArea[name] || 0;
    const categoryPercentage = (categoryArea / totalArea) * 100;
    return (
      <tr key={id}>
        <td>
          <span className="otbn-checkbox" style={{ background: color }} />
          <label htmlFor="pie-chart-category-2">{name}</label>
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

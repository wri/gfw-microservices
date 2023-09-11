import React from 'react';
import { eudrDiagnosticsChartsColors } from '../eudrDiagnosticsChartsColors.constants';
import {
  prettifyNum,
  formatNum,
  formatPct,
} from '../../../../locations/js/utils/diagnostics.utils';
import './CategoryCheckbox.scss';

function Table({ data }) {
  const rows = data?.map(({ id, category, coverage, totalAreaHA }) => {
    return (
      <tr key={id}>
        <td>
          <span
            className="category-checkbox"
            style={{ background: eudrDiagnosticsChartsColors[id] }}
          />
          <label htmlFor={category}>{category}</label>
        </td>
        <td>{formatPct(coverage)}</td>
        <td>{prettifyNum(formatNum(totalAreaHA))}</td>
      </tr>
    );
  });

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>COVERAGE (%)</th>
            <th>TOTAL AREA (HA)</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export default Table;

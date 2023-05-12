import React from 'react';
import { prettifyNum, formatNum, formatPct } from '../../../../utils/diagnostics.utils';
import './OtbnTable.scss';

function Table({ data }) {
  const argentinaOtbnArea = JSON.parse(data?.arg_otbn_area);
  const categoryIArea = argentinaOtbnArea['Category I'];
  const categoryIIArea = argentinaOtbnArea['Category II'];
  const categoryIIIArea = argentinaOtbnArea['Category III'];
  const totalArea = categoryIArea + categoryIIArea + categoryIIIArea;
  const categoryIPercentage = (categoryIArea / totalArea) * 100;
  const categoryIIPercentage = (categoryIIArea / totalArea) * 100;
  const categoryIIIPercentage = (categoryIIIArea / totalArea) * 100;
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
        <tbody>
          <tr>
            <td>
              <span className="otbn-checkbox" style={{ background: 'rgba(151,189,61,255)' }} />
              <label htmlFor="pie-chart-category-1">Category I</label>
            </td>
            <td>{formatPct(categoryIPercentage)}</td>
            <td>{prettifyNum(formatNum(categoryIArea))}</td>
          </tr>
          <tr>
            <td>
              <span className="otbn-checkbox" style={{ background: 'rgba(255,204,51,255)' }} />
              <label htmlFor="pie-chart-category-2">Category II</label>
            </td>
            <td>{formatPct(categoryIIPercentage)}</td>
            <td>{prettifyNum(formatNum(categoryIIArea))}</td>
          </tr>
          <tr>
            <td>
              <span className="otbn-checkbox" style={{ background: 'rgba(238,37,33,255)' }} />
              <span>Category III</span>
            </td>
            <td>{formatPct(categoryIIIPercentage)}</td>
            <td>{prettifyNum(formatNum(categoryIIIArea))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Table;

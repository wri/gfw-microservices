import React from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';

function ChartsSelector({
  id,
  chartsSelectorTitle,
  dataCy,
  diagnosticChecked = true,
  checkedChartLabels,
  setCheckedChartLabels,
  totalLossByCategory,
  totalLoss,
}) {
  return (
    <div className="chart-legends-table">
      <table>
        <thead>
          <tr>
            <th />
            <th className="label right">Total Loss (ha)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th data-cy={dataCy}>
              <label htmlFor={`${id}-checkbox`} className="legend-square-label">
                {chartsSelectorTitle}
              </label>
            </th>

            <td className="right">{prettifyNum(formatNum(totalLoss))}</td>
          </tr>

          {checkedChartLabels.map(({ id, legend, color, checked }) => (
            <tr key={id}>
              <td>
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    setCheckedChartLabels(
                      checkedChartLabels.map((item) =>
                        item.id === id ? { ...item, checked: !item.checked } : item
                      )
                    );
                  }}
                  disabled={!diagnosticChecked}
                />
                <label
                  htmlFor={id}
                  className={`legend-square-label ${!diagnosticChecked ? 'peat-disabled' : ''}`}
                  style={{ background: 'none' }}
                >
                  <span
                    className="otbn-checkbox"
                    style={{
                      opacity: checked ? 1 : 0.2,
                      background: color,
                    }}
                  />
                  {legend}
                </label>
              </td>
              <td className="right">{prettifyNum(formatNum(totalLossByCategory[id])) || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChartsSelector;

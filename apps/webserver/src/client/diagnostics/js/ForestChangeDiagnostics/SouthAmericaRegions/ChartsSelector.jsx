import React from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';

function ChartsSelector({
  id,
  label,
  dataCy,
  diagnosticChecked = true,
  checkedCategories,
  setCheckedCategories,
  totalLossByCategory,
  totalLoss,
}) {
  return (
    <div className="locations-diagnostics-table">
      <table>
        <thead>
          <tr>
            <th />
            <th className="label right">Total Loss (ha)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="locations-diagnostics-table__row parent">
            <th className="locations-diagnostics-table__column" data-cy={dataCy}>
              <label htmlFor={`${id}-checkbox`} className="legend-square-label">
                {label}
              </label>
            </th>

            <td className="right">{prettifyNum(formatNum(totalLoss))}</td>
          </tr>

          {checkedCategories.map(({ id, name, color, checked }) => (
            <tr key={id} className="locations-diagnostics-table__row child">
              <td className="locations-diagnostics-table__column indent legend-square-label">
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    console.log(e);
                    setCheckedCategories(
                      checkedCategories.map((item) =>
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
                  {name}
                </label>
              </td>
              <td className="right">{prettifyNum(formatNum(totalLossByCategory[name])) || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChartsSelector;

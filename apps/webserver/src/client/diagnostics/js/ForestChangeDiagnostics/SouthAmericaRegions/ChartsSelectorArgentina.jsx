import React from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';
import { getDataFromPath, allYearsHaveZeroValue } from './barChart.utils';

function ChartsSelectorArgentina({
  selectedOptionId,
  onOptionChange,
  chartsConfiguration,
  updateCheckedLabels,
  argentinaPieChartsData,
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
          {chartsConfiguration.map((option) => {
            // Check if all chartLabels have zero value
            const allZeroValue = option?.chartLabels?.every((label) => {
              if (label?.dataPath) {
                const barChartData = getDataFromPath(argentinaPieChartsData, label.dataPath);
                return allYearsHaveZeroValue(barChartData);
              }
              return false;
            });

            return (
              <>
                <tr>
                  <th data-cy={option.dataCy}>
                    <input
                      id={option.id}
                      type="radio"
                      value={option.id}
                      checked={selectedOptionId === option.id}
                      onChange={() => onOptionChange(option.id)}
                      disabled={allZeroValue} // Disable the option if all chartLabels have zero value
                    />

                    <label htmlFor={option.id} className="legend-square-label">
                      {option.chartsSelectorTitle}
                    </label>
                  </th>

                  <td className="right">
                    {option?.totalLoss && prettifyNum(formatNum(option.totalLoss))}
                  </td>
                </tr>
                {selectedOptionId === option.id &&
                  option?.chartLabels.map(
                    ({ id, legend, color, checked, totalLossByCategory, dataPath }) => {
                      let disabled;
                      if (dataPath) {
                        const barChartData = getDataFromPath(argentinaPieChartsData, dataPath);
                        disabled = allYearsHaveZeroValue(barChartData);
                      }

                      return (
                        <tr key={id}>
                          <td
                            className={`chart-legends-table__label ${
                              disabled && 'chart-legends-table__label--disabled'
                            }`}
                          >
                            <input
                              id={id}
                              type="checkbox"
                              disabled={disabled}
                              checked={checked}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                updateCheckedLabels(option.id, id, isChecked);
                              }}
                            />
                            <div>
                              {/* adding an extra div to avoid the styling from a declared selector with low specificity in _base.scss: */}
                              {/* input[type='checkbox'].column-checkbox:checked + label  */}
                              <label htmlFor={id}>
                                <span
                                  className="chart-legends-table__checkbox"
                                  style={{
                                    background: disabled ? 'gray' : color,
                                    opacity: checked ? 1 : 0.2,
                                  }}
                                />
                                {legend}
                              </label>
                            </div>
                          </td>
                          <td className="right">
                            {(totalLossByCategory && prettifyNum(formatNum(totalLossByCategory))) ||
                              ''}
                          </td>
                        </tr>
                      );
                    }
                  )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ChartsSelectorArgentina;

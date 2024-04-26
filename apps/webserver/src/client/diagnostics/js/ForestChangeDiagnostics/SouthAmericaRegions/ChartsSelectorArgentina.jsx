import React from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';
import { getDataAndCheckIfAllYearsZero } from './barChart.utils';

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
          {chartsConfiguration.map(
            ({ dataCy, chartLabels, id: optionId, chartsSelectorTitle, totalLoss }) => {
              // Check if all chartLabels have zero value
              const allZeroValue = chartLabels?.every(({ dataPath }) =>
                getDataAndCheckIfAllYearsZero(argentinaPieChartsData, dataPath)
              );
              const isSingleChartPresent = chartLabels?.length === 1;
              return (
                <>
                  <tr>
                    <th data-cy={dataCy}>
                      <input
                        id={optionId}
                        type="radio"
                        value={optionId}
                        checked={selectedOptionId === optionId}
                        onChange={() => onOptionChange(optionId)}
                        disabled={allZeroValue} // Disable the option if all chartLabels have zero value
                      />

                      <label htmlFor={optionId} className="legend-square-label">
                        {chartsSelectorTitle}
                      </label>
                    </th>

                    <td className="right">{totalLoss && prettifyNum(formatNum(totalLoss))}</td>
                  </tr>
                  {selectedOptionId === optionId &&
                    chartLabels?.map(
                      ({ id, legend, color, checked, totalLossByCategory, dataPath }) => {
                        const isEveryChartYearValueZero = getDataAndCheckIfAllYearsZero(
                          argentinaPieChartsData,
                          dataPath
                        );

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
                                disabled={disableCheckbox || disabled} // Disable if there's only one chartLabels
                                checked={disableCheckbox || checked} // Keep checked if there's only one chartLabels
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  updateCheckedLabels(optionId, id, isChecked);
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
                              {(totalLossByCategory &&
                                prettifyNum(formatNum(totalLossByCategory))) ||
                                ''}
                            </td>
                          </tr>
                        );
                      }
                    )}
                </>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ChartsSelectorArgentina;

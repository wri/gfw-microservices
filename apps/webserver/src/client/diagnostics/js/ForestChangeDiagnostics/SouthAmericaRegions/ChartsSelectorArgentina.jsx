import React from 'react';
import Checkbox from '@mui/material/Checkbox';
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
            <th className="label right"></th>
          </tr>
        </thead>
        <tbody>
          {chartsConfiguration.map(
            ({ dataCy, chartLabels, id: optionId, chartsSelectorTitle, totalLoss }) => {
              // Determine the count of options with non-zero data
              const nonZeroOptions = chartLabels?.filter(
                ({ dataPath }) => !getDataAndCheckIfAllYearsZero(argentinaPieChartsData, dataPath)
              ).length;

              const isCheckboxDisabled = nonZeroOptions === 1;
              const isRadioButtonDisabled = nonZeroOptions === 0;

              return (
                <React.Fragment key={optionId}>
                  <tr>
                    <th data-cy={dataCy}>
                      <input
                        id={optionId}
                        type="radio"
                        value={optionId}
                        checked={selectedOptionId === optionId}
                        onChange={() => onOptionChange(optionId)}
                        disabled={isRadioButtonDisabled} // Disable the option if all chartLabels have zero value
                      />

                      <label htmlFor={optionId} className="legend-square-label">
                        {chartsSelectorTitle}
                      </label>
                    </th>

                    <td className="right">{totalLoss && prettifyNum(formatNum(totalLoss))}</td>
                  </tr>
                  {!isRadioButtonDisabled &&
                    selectedOptionId === optionId &&
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
                                isEveryChartYearValueZero && 'chart-legends-table__label--disabled'
                              }`}
                            >
                              <label htmlFor={id}>
                                <Checkbox
                                  id={id}
                                  disabled={isCheckboxDisabled || isEveryChartYearValueZero}
                                  checked={checked} // Keep checked if there's only one chartLabels
                                  onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    updateCheckedLabels(optionId, id, isChecked);
                                  }}
                                  sx={{
                                    padding: 0,
                                    color,
                                    '&.Mui-checked': {
                                      color,
                                    },
                                  }}
                                />
                                {legend}
                              </label>
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
                </React.Fragment>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ChartsSelectorArgentina;

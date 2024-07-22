import React from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import {
  getDataAndCheckIfAllYearsZero,
  getDataFromPath,
  calculateTotalLossForAllTypes,
} from './barChart.utils';

export function ChartsSelectorColombia({
  selectedOptionId,
  onOptionChange,
  chartsConfiguration,
  countryPieChartsData,
  graphUnit,
}) {
  return (
    <div className="chart-legends-table">
      <table>
        <thead>
          <tr>
            <th />
            <th className="label right">{graphUnit}</th>
          </tr>
        </thead>
        <tbody>
          {chartsConfiguration.map(
            ({
              dataCy,
              types,
              id: optionId,
              chartsSelectorTitle,
              infoBubbleId,
              totalLoss,
              dataPath,
            }) => {
              // Determine the count of options with non-zero data
              const nonZeroOptions = types?.filter(
                ({ dataPath }) => !getDataAndCheckIfAllYearsZero(countryPieChartsData, dataPath)
              ).length;

              let chartsSelectorData;
              if (countryPieChartsData && dataPath) {
                chartsSelectorData = getDataFromPath(countryPieChartsData, dataPath);
              }

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
                        {infoBubbleId && <InfoBubble infoBubbleId={infoBubbleId} />}
                      </label>
                    </th>

                    <td className="right">{totalLoss && prettifyNum(formatNum(totalLoss))}</td>
                  </tr>
                  {!isRadioButtonDisabled &&
                    selectedOptionId === optionId &&
                    types?.map(({ id, name, legend, color, chartLabels }) => {
                      const typeData = chartsSelectorData?.[name];
                      const totalLoss = calculateTotalLossForAllTypes(typeData);
                      return (
                        <>
                          <tr key={id} className="chart-legends-table__first-level-legend">
                            <td>
                              <span
                                className="chart-legends-table__checkbox"
                                style={{ background: color }}
                              />
                              <label htmlFor={`pie-chart-label-${id}`}>{legend}</label>
                            </td>
                            <td>{prettifyNum(formatNum(totalLoss))}</td>
                          </tr>
                          {chartLabels?.map((chartLabel) => (
                            <tr className="chart-legends-table__second-level-legend">
                              <td>{chartLabel}</td>
                              <td>
                                {prettifyNum(
                                  formatNum(calculateTotalLossForAllTypes(typeData?.[chartLabel]))
                                )}
                              </td>
                            </tr>
                          ))}
                        </>
                      );
                    })}
                </React.Fragment>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}

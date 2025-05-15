import { Fragment } from 'react';
import Checkbox from '@mui/material/Checkbox';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import {
  getDataAndCheckIfAllYearsZero,
  getDataFromPath,
  calculateTotalLossForAllCategories,
} from './barChart.utils';
import BetaTag from '../../../../common/js/components/BetaTag';

export function SelectorWithOneLevel({
  selectedOptionId,
  onOptionChange,
  chartsConfiguration,
  onCheckedLabelsUpdate,
  countryPieChartsData,
  showTotalLoss = false,
}) {
  return (
    <>
      {chartsConfiguration.map(
        ({
          dataCy,
          dataPath: categoryDataPath,
          dateRange,
          chartLabels,
          id: optionId,
          chartsSelectorTitle,
          infoBubbleId,
        }) => {
          // Determine the count of options with non-zero data
          const nonZeroOptions = chartLabels?.filter(
            ({ dataPath }) => !getDataAndCheckIfAllYearsZero(countryPieChartsData, dataPath)
          ).length;

          const isCheckboxDisabled = nonZeroOptions === 1;
          const isRadioButtonDisabled = nonZeroOptions === 0;

          const data = getDataFromPath(countryPieChartsData, categoryDataPath);
          const totalLoss = calculateTotalLossForAllCategories(data, dateRange);

          return (
            <Fragment key={optionId}>
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

                <td className="right" style={{ width: showTotalLoss ? '100px' : 'auto' }}>
                  {showTotalLoss && prettifyNum(formatNum(totalLoss))}
                </td>
              </tr>
              {!isRadioButtonDisabled &&
                selectedOptionId === optionId &&
                chartLabels?.map(
                  ({
                    id,
                    legend,
                    color,
                    checked,
                    totalLossByCategory,
                    dataPath,
                    preview = false,
                  }) => {
                    const isEveryChartYearValueZero = getDataAndCheckIfAllYearsZero(
                      countryPieChartsData,
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
                              checked={checked} // Keep checked if there's only one chartLabel
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                onCheckedLabelsUpdate(optionId, id, isChecked);
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
                            {preview && <BetaTag>(Preview)</BetaTag>}
                          </label>
                        </td>
                        <td className="right">
                          {(totalLossByCategory && prettifyNum(formatNum(totalLossByCategory))) ||
                            ''}
                        </td>
                      </tr>
                    );
                  }
                )}
            </Fragment>
          );
        }
      )}
    </>
  );
}

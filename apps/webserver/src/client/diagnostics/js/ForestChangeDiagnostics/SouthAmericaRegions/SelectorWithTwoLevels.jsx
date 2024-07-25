import React from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import {
  getDataAndCheckIfAllYearsZero,
  getDataFromPath,
  calculateTotalLossForAllTypes,
} from './barChart.utils';

export function SelectorWithTwoLevels({
  data,
  chartConfiguration,
  selectedOptionId,
  onOptionChange,
}) {
  const {
    dataCy,
    types,
    id: optionId,
    chartsSelectorTitle,
    infoBubbleId,
    dataPath,
  } = chartConfiguration;

  // Determine the count of options with non-zero data
  const nonZeroOptions = types?.filter(
    ({ dataPath }) => !getDataAndCheckIfAllYearsZero(data, dataPath)
  ).length;

  let chartsSelectorData;
  if (data && dataPath) {
    chartsSelectorData = getDataFromPath(data, dataPath);
  }

  const isRadioButtonDisabled = nonZeroOptions === 0;

  const totalLoss = calculateTotalLossForAllTypes(chartsSelectorData);

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
        types?.map(({ id, name, legend, color }) => {
          const subCategories = chartsSelectorData?.[name];
          const totalLoss = calculateTotalLossForAllTypes(subCategories);
          return (
            <React.Fragment key={id}>
              <tr className="chart-legends-table__first-level-legend">
                <th>
                  <span className="chart-legends-table__checkbox" style={{ background: color }} />
                  <label htmlFor={`pie-chart-label-${id}`}>{legend}</label>
                </th>
                <th>{prettifyNum(formatNum(totalLoss))}</th>
              </tr>
              {subCategories &&
                Object.entries(subCategories).map(([key, value]) => (
                  <tr key={id + key} className="chart-legends-table__second-level-legend">
                    <td>{key}</td>
                    <td>{prettifyNum(formatNum(calculateTotalLossForAllTypes(value)))}</td>
                  </tr>
                ))}
            </React.Fragment>
          );
        })}
    </>
  );
}

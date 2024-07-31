import React, { useState } from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import {
  getDataAndCheckIfAllYearsZero,
  getDataFromPath,
  calculateTotalLossForAllTypes,
} from './barChart.utils';
import IconButton from '@mui/material/IconButton';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

export function SelectorWithTwoLevels({
  data,
  chartConfiguration,
  selectedOptionId,
  onOptionChange,
}) {
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const {
    dataCy,
    types,
    id: optionId,
    chartsSelectorTitle,
    infoBubbleId,
    dataPath,
    dateRange,
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

  const totalLoss = calculateTotalLossForAllTypes(chartsSelectorData, dateRange);

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
        types?.map(({ id, name, legend, color }, index) => {
          const subCategories = chartsSelectorData?.[name];
          const totalLoss = calculateTotalLossForAllTypes(subCategories, dateRange);
          const isCategoryCollapsed = collapsedCategories[name];

          return (
            <React.Fragment key={id}>
              <tr
                className={`chart-legends-table__first-level-legend ${
                  index > 0 ? 'chart-legends-table__first-level-legend--with-padding-top' : ''
                }`}
              >
                <th>
                  <IconButton
                    disableRipple
                    style={{ visibility: subCategories ? 'visible' : 'hidden' }}
                    onClick={() =>
                      setCollapsedCategories((prev) => ({ ...prev, [name]: !prev?.[name] }))
                    }
                  >
                    {isCategoryCollapsed ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                  <span className="chart-legends-table__checkbox" style={{ background: color }} />
                  <label htmlFor={`pie-chart-label-${id}`}>{legend}</label>
                </th>
                <th>{prettifyNum(formatNum(totalLoss))}</th>
              </tr>
              {subCategories &&
                !isCategoryCollapsed &&
                Object.entries(subCategories).map(([key, value]) => (
                  <tr key={id + key} className="chart-legends-table__second-level-legend">
                    <td>{key}</td>
                    <td>
                      {prettifyNum(formatNum(calculateTotalLossForAllTypes(value, dateRange)))}
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          );
        })}
    </>
  );
}

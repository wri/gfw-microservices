import React, { useState } from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';
import InfoBubble from '../../../../common/js/components/InfoBubble';
import {
  getDataAndCheckIfAllYearsZero,
  getDataFromPath,
  calculateTotalLossForAllCategories,
} from './barChart.utils';
import IconButton from '@mui/material/IconButton';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const COVERAGE_DECIMAL_PLACES = 2;

export function SelectorWithTwoLevels({
  data,
  chartConfiguration,
  selectedOptionId,
  onOptionChange,
}) {
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const {
    dataCy,
    subCategories,
    id: optionId,
    chartsSelectorTitle,
    infoBubbleId,
    dataPath,
    dateRange,
  } = chartConfiguration;

  // Determine the count of options with non-zero data
  const nonZeroOptions = subCategories?.filter(
    ({ dataPath }) => !getDataAndCheckIfAllYearsZero(data, dataPath)
  ).length;

  let chartsSelectorData;
  if (data && dataPath) {
    chartsSelectorData = getDataFromPath(data, dataPath);
  }

  const isRadioButtonDisabled = nonZeroOptions === 0;

  const totalTreeCoverLoss = dateRange
    ? calculateTotalLossForAllCategories(chartsSelectorData, dateRange)
    : 0;

  let totalCoverageOverlap = 0;

  if (!dateRange && subCategories) {
    subCategories.forEach(({ id }) => {
      const subCategoriesData = chartsSelectorData?.[id] ?? {};
      totalCoverageOverlap = Object.values(subCategoriesData).reduce(
        (acc, val) => acc + val,
        totalCoverageOverlap
      );
    });
  }

  return (
    <>
      {onOptionChange && (
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

          <td className="right">
            {totalTreeCoverLoss && prettifyNum(formatNum(totalTreeCoverLoss))}
          </td>
        </tr>
      )}
      {!isRadioButtonDisabled &&
        selectedOptionId === optionId &&
        subCategories?.map(({ id, legend, color }, index) => {
          const subCategoriesData = chartsSelectorData?.[id] ?? {};
          const totalLossPerCategory = dateRange
            ? calculateTotalLossForAllCategories(subCategoriesData, dateRange)
            : Object.values(subCategoriesData).reduce((acc, val) => acc + val, 0);
          const isCategoryCollapsed = collapsedCategories[id];

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
                    style={{ visibility: subCategoriesData ? 'visible' : 'hidden' }}
                    onClick={() =>
                      setCollapsedCategories((prev) => ({ ...prev, [id]: !prev?.[id] }))
                    }
                  >
                    {isCategoryCollapsed ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                  <span className="chart-legends-table__checkbox" style={{ background: color }} />
                  <label htmlFor={`pie-chart-label-${id}`}>{legend}</label>
                </th>
                {totalCoverageOverlap > 0 && (
                  <th>
                    {((totalLossPerCategory / totalCoverageOverlap) * 100).toFixed(
                      COVERAGE_DECIMAL_PLACES
                    )}
                  </th>
                )}
                <th>{prettifyNum(formatNum(totalLossPerCategory))}</th>
              </tr>
              {subCategoriesData &&
                !isCategoryCollapsed &&
                Object.entries(subCategoriesData).map(([key, value]) => (
                  <tr key={id + key} className="chart-legends-table__second-level-legend">
                    <td>{key}</td>
                    {totalCoverageOverlap > 0 && (
                      <td>
                        {((value / totalCoverageOverlap) * 100).toFixed(COVERAGE_DECIMAL_PLACES)}
                      </td>
                    )}
                    <td>
                      {prettifyNum(
                        formatNum(
                          dateRange ? calculateTotalLossForAllCategories(value, dateRange) : value
                        )
                      )}
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          );
        })}
    </>
  );
}

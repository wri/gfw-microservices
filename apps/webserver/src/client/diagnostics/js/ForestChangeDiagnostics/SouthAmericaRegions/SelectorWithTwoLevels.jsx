import { useState, Fragment } from 'react';
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
  const [collapsedSubLayers, setCollapsedSubLayers] = useState({});

  const {
    dataCy,
    subLayers,
    id: optionId,
    chartsSelectorTitle,
    infoBubbleId,
    dataPath,
    dateRange,
  } = chartConfiguration;

  // Determine the count of options with non-zero data
  const nonZeroOptions = subLayers?.filter(
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

  if (!dateRange && subLayers) {
    subLayers.forEach(({ id }) => {
      const subLayersData = chartsSelectorData?.[id] ?? {};
      totalCoverageOverlap = Object.values(subLayersData).reduce(
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
        subLayers?.map(({ id, legend, color }, index) => {
          const subLayersData = chartsSelectorData?.[id] ?? {};
          const totalLossPerSubLayer = dateRange
            ? calculateTotalLossForAllCategories(subLayersData, dateRange)
            : Object.values(subLayersData).reduce((acc, val) => acc + val, 0);

          const subLayersDataWithTotalLoss = Object.entries(subLayersData)
            ?.map(([key, value]) => ({
              data: { [key]: value },
              totalLoss: dateRange ? calculateTotalLossForAllCategories(value, dateRange) : value,
            }))
            .sort((a, b) => b.totalLoss - a.totalLoss);

          const isSubLayerCollapsed = collapsedSubLayers[id];

          return (
            <Fragment key={id}>
              <tr
                className={`chart-legends-table__first-level-legend ${
                  index > 0 ? 'chart-legends-table__first-level-legend--with-padding-top' : ''
                }`}
              >
                <th>
                  <IconButton
                    disableRipple
                    style={{ visibility: subLayersData ? 'visible' : 'hidden' }}
                    onClick={() =>
                      setCollapsedSubLayers((prev) => ({ ...prev, [id]: !prev?.[id] }))
                    }
                  >
                    {isSubLayerCollapsed ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                  <span className="chart-legends-table__checkbox" style={{ background: color }} />
                  <label htmlFor={`pie-chart-label-${id}`}>{legend}</label>
                </th>
                {totalCoverageOverlap > 0 && (
                  <th>
                    {((totalLossPerSubLayer / totalCoverageOverlap) * 100).toFixed(
                      COVERAGE_DECIMAL_PLACES
                    )}
                  </th>
                )}
                <th>{prettifyNum(formatNum(totalLossPerSubLayer))}</th>
              </tr>
              {subLayersData &&
                !isSubLayerCollapsed &&
                Object.entries(subLayersDataWithTotalLoss).map(([, { data, totalLoss }]) => {
                  const secondarySubLayerName = Object.keys(data)[0];
                  return (
                    <tr
                      key={id + secondarySubLayerName}
                      className="chart-legends-table__second-level-legend"
                    >
                      <td>{secondarySubLayerName}</td>
                      {totalCoverageOverlap > 0 && (
                        <td>
                          {((totalLoss / totalCoverageOverlap) * 100).toFixed(
                            COVERAGE_DECIMAL_PLACES
                          )}
                        </td>
                      )}
                      <td>{prettifyNum(formatNum(totalLoss))}</td>
                    </tr>
                  );
                })}
            </Fragment>
          );
        })}
    </>
  );
}

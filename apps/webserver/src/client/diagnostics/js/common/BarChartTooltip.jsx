import React from 'react';
import { prettifyNum, formatNum } from '../../../common/js/utils/diagnostics.utils';
import './BarChartTooltip.scss';

export function BarCharTooltip({
  options,
  series,
  y,
  rawBarChartData,
  isDataWithTwoLevelsOfCategory,
}) {
  const transifex = Transifex.live.translateText;

  const { color: optionsColor, label, type, x } = options;
  const { color: seriesColor, userOptions } = series;
  const tooltipText = type === 'PRODES' ? `${type} (${label})` : userOptions.name || userOptions.id;

  return (
    <div className="bar-chart-tooltip">
      <tr
        className={`bar-chart-tooltip__category ${
          isDataWithTwoLevelsOfCategory && 'bar-chart-tooltip__category--without-bottom-border'
        }`}
      >
        <td
          style={{
            color: !isDataWithTwoLevelsOfCategory && (optionsColor || seriesColor),
            padding: 0,
          }}
        >
          {transifex(tooltipText)}:
        </td>
        <td>
          <b>{!isDataWithTwoLevelsOfCategory && `${prettifyNum(formatNum(y || 0))}ha`} </b>
        </td>
      </tr>
      {getSubcategories(rawBarChartData, userOptions.id).map(([key, value]) => (
        <tr className="bar-chart-tooltip__subcategory">
          <td>{key}</td>
          <td>
            <b>{prettifyNum(formatNum(getValueFromSpecificYear(value, x)))} ha</b>
          </td>
        </tr>
      ))}
    </div>
  );
}

const getSubcategories = (rawBarChartData, categoryId) => {
  const subCategoryData =
    rawBarChartData &&
    Object.keys(rawBarChartData).find((key) => key.toLowerCase() === categoryId.toLowerCase());

  if (!subCategoryData) return [];

  return Object.entries(rawBarChartData[subCategoryData]);
};

const getValueFromSpecificYear = (array, year) => array.find((x) => x.year === year).value;

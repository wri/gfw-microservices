import { prettifyNum, formatNum } from '../../../common/js/utils/diagnostics.utils';
import './BarChartTooltip.scss';

export function BarCharTooltip({
  options,
  series,
  y,
  rawBarChartData,
  isDataWithTwoLevelsOfCategory,
}) {
  const transifex = (text) => window.Transifex?.live?.translateText?.(text) ?? text;

  const { color: optionsColor, label, type, x: year } = options;
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
      {getSubLayers(rawBarChartData, userOptions.id, year).map(([key, value]) => (
        <tr className="bar-chart-tooltip__subcategory">
          <td>{key}</td>
          <td>
            <b>{prettifyNum(formatNum(value))} ha</b>
          </td>
        </tr>
      ))}
    </div>
  );
}

const getSubLayers = (rawBarChartData, categoryId, year) => {
  const subLayerData =
    rawBarChartData &&
    Object.keys(rawBarChartData).find((key) => key.toLowerCase() === categoryId.toLowerCase());

  if (!subLayerData) {
    return [];
  }

  return Object.entries(rawBarChartData[subLayerData])
    .map((category) => {
      return {
        category: category[0],
        values: category[1].filter((entry) => entry.year === year),
      };
    })
    .sort((a, b) => b.values[0].value - a.values[0].value)
    .map(({ category, values }) => [category, values[0].value]);
};

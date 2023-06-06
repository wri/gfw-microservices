import React from 'react';
import { v1 as uuidv1 } from 'uuid';
import _sum from 'lodash/sum';

import { formatNum, prettifyNum } from '../../../utils/diagnostics.utils';
import { PRODES_HIGHCHARTS_BAR_CONFIGS } from './SouthAmericaRegions.config';

const ProdesLegend = ({ data }) => {
  const prodesLegendLabelValues = {};

  PRODES_HIGHCHARTS_BAR_CONFIGS.forEach(
    (configItem) => (prodesLegendLabelValues[configItem.label] = [])
  );
  PRODES_HIGHCHARTS_BAR_CONFIGS.forEach((configItem) => {
    Object.keys(data).forEach((year) => {
      if (configItem.years.includes(parseInt(year))) {
        prodesLegendLabelValues[configItem.label].push(data[year]);
      }
    });
  });

  return (
    <React.Fragment>
      {PRODES_HIGHCHARTS_BAR_CONFIGS.map((config) => (
        <tr key={uuidv1()} className="locations-diagnostics-table__row child">
          <td className="locations-diagnostics-table__column indent legend-square-label">
            <div className="legend-square" style={{ backgroundColor: config.color }} />
            <span>{config.label}</span>
          </td>
          <td className="right">
            {prettifyNum(formatNum(_sum(prodesLegendLabelValues[config.label])))}
          </td>
        </tr>
      ))}
    </React.Fragment>
  );
};

export default ProdesLegend;

import React from 'react';

import { prettifyNum, formatNum } from '../../../common/js/utils/diagnostics.utils';

export function BarCharTooltip({ options, series, y }) {
  const transifex = Transifex.live.translateText;

  const { color: optionsColor, label, type } = options;
  const { color: seriesColor, userOptions } = series;
  const tooltipText = type === 'PRODES' ? `${type} (${label})` : userOptions.name || userOptions.id;

  return (
    <tr>
      <td style={{ color: optionsColor || seriesColor, padding: 0 }}>{transifex(tooltipText)}: </td>
      <td style={{ paddingTop: 0, paddingBottom: 0 }}>
        <b>{prettifyNum(formatNum(y || 0))} ha</b>
      </td>
    </tr>
  );
}

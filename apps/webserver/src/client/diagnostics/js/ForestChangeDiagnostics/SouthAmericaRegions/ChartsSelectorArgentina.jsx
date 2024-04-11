import React from 'react';
import { formatNum, prettifyNum } from '../../../../common/js/utils/diagnostics.utils';

function ChartsSelectorArgentina({
  selectedOptionId,
  onOptionChange,
  chartsConfiguration,

  updateCheckedLabels,
}) {
  return (
    <div className="chart-legends-table">
      <table>
        <thead>
          <tr>
            <th />
            <th className="label right">Total Loss (ha)</th>
          </tr>
        </thead>
        <tbody>
          {chartsConfiguration.map((option) => (
            <>
              <tr>
                <th data-cy={option.dataCy}>
                  <input
                    id={option.id}
                    type="radio"
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => onOptionChange(option.id)}
                  />

                  <label htmlFor={option.id} className="legend-square-label">
                    {option.chartsSelectorTitle}
                  </label>
                </th>

                <td className="right">
                  {option?.totalLoss && prettifyNum(formatNum(option.totalLoss))}
                </td>
              </tr>
              {selectedOptionId === option.id &&
                option?.chartLabels.map(({ id, legend, color, checked, totalLossByCategory }) => (
                  <tr key={id}>
                    <td>
                      <input
                        id={id}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          updateCheckedLabels(option.id, id, isChecked);
                        }}
                      />
                      <label htmlFor={id} className="legend-square-label">
                        <span
                          className="otbn-checkbox"
                          style={{
                            opacity: checked ? 1 : 0.2,
                            background: color,
                          }}
                        />
                        {legend}
                      </label>
                    </td>
                    <td className="right">
                      {(totalLossByCategory && prettifyNum(formatNum(totalLossByCategory))) || ''}
                    </td>
                  </tr>
                ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChartsSelectorArgentina;

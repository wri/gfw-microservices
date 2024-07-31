import React from 'react';
import { SelectorWithOneLevel } from './SelectorWithOneLevel';

function ChartsSelectorArgentina({
  selectedOptionId,
  onOptionChange,
  chartsConfiguration,
  updateCheckedLabels,
  argentinaPieChartsData,
  graphUnit,
}) {
  return (
    <div className="chart-legends-table">
      <table>
        <thead>
          <tr>
            <th />
            <th className="label right">{graphUnit}</th>
          </tr>
        </thead>
        <tbody>
          <SelectorWithOneLevel
            selectedOptionId={selectedOptionId}
            onOptionChange={onOptionChange}
            countryPieChartsData={argentinaPieChartsData}
            chartsConfiguration={chartsConfiguration}
            updateCheckedLabels={updateCheckedLabels}
          />
        </tbody>
      </table>
    </div>
  );
}

export default ChartsSelectorArgentina;

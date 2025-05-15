import { SelectorWithOneLevel } from './SelectorWithOneLevel';

function ChartsSelectorArgentina({
  selectedOptionId,
  onOptionChange,
  chartsConfiguration,
  onCheckedLabelsUpdate,
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
            onCheckedLabelsUpdate={onCheckedLabelsUpdate}
          />
        </tbody>
      </table>
    </div>
  );
}

export default ChartsSelectorArgentina;

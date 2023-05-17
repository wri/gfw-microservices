import {
  listNameParser,
  pieChartParser,
  locationNameParser,
} from './shared.parser';
import { dataLayerParser } from './south.america.parser';
import { southEastAsiaOverlapParser } from './south.east.asia.parser';
import { soyParser } from './soy.parser';
import { palmRiskAnalysisParser } from './palm.risk.analysis.parser';
import { diagnosticLocationSummaryParser } from './diagnostic.location.summary.parser';

const overheadParser = ({
  operation,
  listLevelAnalysis,
  data,
  dataRow,
  csvData,
}) => {
  const parserFunctions = {
    list_name: listNameParser,
    pie_chart: pieChartParser,
    'Location Name': locationNameParser,
    data_layer: dataLayerParser,
    seAsia_overlap: southEastAsiaOverlapParser,
    soy: soyParser,
    palmRiskAnalysis: palmRiskAnalysisParser,
    forestChangeDiagnosticLocationSummary: diagnosticLocationSummaryParser,
    commodityRiskDiagnosticLocationSummary: diagnosticLocationSummaryParser,
  };

  const { name } = operation;
  if (
    name &&
    typeof name === 'string' &&
    Object.prototype.hasOwnProperty.call(parserFunctions, name)
  ) {
    parserFunctions[name]({
      operation,
      dataRow,
      data,
      csvData,
      listLevelAnalysis,
    });
  }
};

export { overheadParser };

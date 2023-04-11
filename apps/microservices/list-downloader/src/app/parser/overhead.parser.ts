import {
  listNameParser,
  pieChartParser,
  locationNameParser,
} from './shared.parser';
import { brazilBiomesParser } from './south.america.parser';
import { southEastAsiaOverlapParser } from './south.east.asia.parser';
import { soyParser } from './soy.parser';
import { palmRiskAnalysisParser } from './palm.risk.analysis.parser';
import { diagnosticLocationSummaryParser } from './diagnostic.location.summary.parser';

const overheadParser = (
  operation,
  dataRow,
  data,
  csvData,
  listLevelAnalysis
) => {
  const parserFunctions = {
    list_name: listNameParser,
    pie_chart: pieChartParser,
    'Location Name': locationNameParser,
    brazil_biomes: brazilBiomesParser,
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

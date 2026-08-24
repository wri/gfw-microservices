// Canonical client-side year and date-range constants used by diagnostics/map UI.
// If you change year values here, ensure they still align with server-side
// DIAGNOSTIC_ANALYSIS_PERIOD in libs/constants/src/lib/diagnostic.constants.ts.
import { DIAGNOSTIC_ANALYSIS_PERIOD } from '@wri-monorepos/constants';

export const latestTreeCoverLossYearForTclDataInMap = DIAGNOSTIC_ANALYSIS_PERIOD.END_YEAR;
export const latestTreeCoverLossYearCommodityRisk =
  DIAGNOSTIC_ANALYSIS_PERIOD.COMMODITY_RISK_END_YEAR;
export const earliestTreeCoverLossYearCommodityRisk = 2002;
export const latestTreeCoverLossYearForTclDataInAnalyses = DIAGNOSTIC_ANALYSIS_PERIOD.END_YEAR;

const todayIso = new Date().toISOString().split('T')[0];
const defaultStartYear = latestTreeCoverLossYearForTclDataInMap + 1;
const startIso = `${defaultStartYear}-01-01`;

export const soyPlantedYearsRange = { from: 2001, to: 2024 };
export const prodesYearsRange = {
  from: DIAGNOSTIC_ANALYSIS_PERIOD.PRODES_START_YEAR,
  to: DIAGNOSTIC_ANALYSIS_PERIOD.PRODES_END_YEAR,
};

export const dcfAlertsDateRange = {
  min: '2020-01-01',
  initialStart: `${latestTreeCoverLossYearForTclDataInMap + 1}-01-01`,
  max: todayIso,
};

export const deforestationAlertDateRange = {
  startDate: startIso,
  endDate: todayIso,
  minDate: `${latestTreeCoverLossYearForTclDataInMap + 1}-01-01`,
  maxDate: todayIso,
};

export const disturbanceAlertsVegetationTypes = {
  AllVegetation: 'all-vegetation',
  TreeCover: 'tree-cover',
};

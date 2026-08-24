export const DIAGNOSTIC_COVERAGE_DECIMAL_PLACES = 2;

// IF YOU ARE CHANGING THE YEAR, CONSIDER SYNCING WITH apps/webserver/src/client/common/js/config.js
export const DIAGNOSTIC_ANALYSIS_PERIOD = {
  START_YEAR: 2001,
  END_YEAR: 2025,
  COMMODITY_RISK_END_YEAR: 2024,
  ARGENTINA_START_YEAR: 2008, // IMPORTANT: If modifying, sync with constant in: apps/webserver/src/client/diagnostics/js/ForestChangeDiagnostics/SouthAmericaRegions/regions-constants.js
  END_YEAR_SOY_PLANTED: 2023, // This is a workaround for soy planted data end year to be different from the others; revert the code that uses this constant once this validation is no longer needed.
  PRODES_START_YEAR: 2008, // IMPORTANT: If modifying, sync with constant in: apps/webserver/src/client/common/js/config.js (prodesYearsRange.from)
  PRODES_END_YEAR: 2025, // IMPORTANT: If modifying, sync with constant in: apps/webserver/src/client/common/js/config.js (prodesYearsRange.to)
};

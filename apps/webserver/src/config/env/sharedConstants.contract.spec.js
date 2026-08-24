import {
  analysisTypes,
  analysisTypesOptionsNewNames,
  DIAGNOSTIC_ANALYSIS_PERIOD,
  DATASET_VERSIONS,
  gfwListsIds,
  listStatus,
} from '@wri-monorepos/constants';

describe('Shared constants contract', () => {
  it('exports analysis types and options used by webserver', () => {
    expect(analysisTypes).toBeDefined();
    expect(analysisTypes.FOREST_CHANGE_DIAGNOSTICS).toBe('FCD');
    expect(analysisTypes.DEFORESTATION_KPIS).toBe('AFI');
    expect(Array.isArray(analysisTypesOptionsNewNames)).toBe(true);
    expect(analysisTypesOptionsNewNames.length).toBeGreaterThan(0);
  });

  it('exports diagnostic analysis period keys consumed by server and client', () => {
    expect(DIAGNOSTIC_ANALYSIS_PERIOD).toBeDefined();
    expect(DIAGNOSTIC_ANALYSIS_PERIOD.END_YEAR).toBeDefined();
    expect(DIAGNOSTIC_ANALYSIS_PERIOD.COMMODITY_RISK_END_YEAR).toBeDefined();
    expect(DIAGNOSTIC_ANALYSIS_PERIOD.ARGENTINA_START_YEAR).toBeDefined();
    expect(DIAGNOSTIC_ANALYSIS_PERIOD.PRODES_START_YEAR).toBeDefined();
    expect(DIAGNOSTIC_ANALYSIS_PERIOD.PRODES_END_YEAR).toBeDefined();
  });

  it('exports dataset versions required by map layer URLs', () => {
    expect(DATASET_VERSIONS).toBeDefined();
    expect(DATASET_VERSIONS.WDPA_PROTECTED_AREAS).toBeDefined();
    expect(DATASET_VERSIONS.IDN_FOREST_AREA).toBeDefined();
    expect(DATASET_VERSIONS.LANDMARK_INDIGENOUS_LANDS).toBeDefined();
    expect(DATASET_VERSIONS.INPE_PRODES).toBeDefined();
  });

  it('exports list ids and list status maps used in managers', () => {
    expect(gfwListsIds).toBeDefined();
    expect(typeof gfwListsIds).toBe('object');
    expect(listStatus).toBeDefined();
    expect(listStatus.Active).toBeDefined();
    expect(listStatus.Pending).toBeDefined();
  });
});

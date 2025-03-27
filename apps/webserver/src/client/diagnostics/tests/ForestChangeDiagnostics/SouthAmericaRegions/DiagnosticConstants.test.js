// Import the backend constants
import { DIAGNOSTIC_ANALYSIS_PERIOD } from '@wri-monorepos/constants';
// Import the client constants
import { regionConstants } from '../../../js/ForestChangeDiagnostics/SouthAmericaRegions/regions.constants';

describe('Diagnostic Constants Synchronization', () => {
  it('should have matching Argentina start year between Server (libs) and Client', () => {
    expect(DIAGNOSTIC_ANALYSIS_PERIOD.ARGENTINA_START_YEAR).toBe(
      regionConstants.argentina.startYear
    );
  });
});

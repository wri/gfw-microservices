import { analysisTypes, analysisTypesOptionsNewNames } from '@wri-monorepos/constants';
import * as webserverConstants from './analysisTypes.constants';

describe('Compare webserver and libs analysisTypes constants', () => {
  it('Compare webserver and libs analysisTypes', () => {
    // For GHG V1 only EAPI will have GHG analysis
    const filteredAnalysisTypes = { ...analysisTypes };
    delete filteredAnalysisTypes.GREENHOUSE_GAS_EMISSIONS;
    expect(webserverConstants.analysisTypes).toEqual(filteredAnalysisTypes);
  });

  it('Compare webserver and libs analysisTypesOptionsNewNames', () => {
    expect(webserverConstants.analysisTypesOptionsNewNames).toEqual(analysisTypesOptionsNewNames);
  });
});

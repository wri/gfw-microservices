import { analysisTypes, analysisTypesOptions } from '@wri-monorepos/constants';
import * as webserverConstants from './analysisTypes.constants';

describe('Compare webserver and libs analysisTypes constants', () => {
  it('Compare webserver and libs analysisTypes', () => {
    expect(webserverConstants.analysisTypes).toEqual(analysisTypes);
  });

  it('Compare webserver and libs analysisTypesOptions', () => {
    expect(webserverConstants.analysisTypesOptions).toEqual(analysisTypesOptions);
  });
});

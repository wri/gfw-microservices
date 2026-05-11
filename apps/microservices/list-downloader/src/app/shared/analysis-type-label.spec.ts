import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { getAnalysisTypeLabel } from './analysis-type-label';

describe('getAnalysisTypeLabel', () => {
  const cases: Array<[BasicFieldsFileRequest, string]> = [
    [{ type: 'afi' }, 'Post-2020'],
    [{ type: 'afiVC' }, 'Post-2020'],
    [{ type: 'alerts' }, 'Alerts'],
    [{ type: 'ghg' }, 'GHG'],
    [{ listView: 'forest_change' }, 'Post-2000'],
    [{ listView: 'commodity_risk' }, 'Palm Risk'],
  ];

  it.each(cases)('%j should produce %s', (filters, expected) => {
    expect(getAnalysisTypeLabel(filters)).toBe(expected);
  });

  it('prefers type over listView when both are set', () => {
    expect(getAnalysisTypeLabel({ type: 'afi', listView: 'forest_change' })).toBe('Post-2020');
  });

  it('returns undefined for raw input downloads', () => {
    expect(getAnalysisTypeLabel({ type: 'input' })).toBeUndefined();
  });

  it('returns undefined for unrecognized listView', () => {
    expect(
      getAnalysisTypeLabel({ listView: 'something_else' } as BasicFieldsFileRequest)
    ).toBeUndefined();
  });

  it('returns undefined for an empty request', () => {
    expect(getAnalysisTypeLabel({} as BasicFieldsFileRequest)).toBeUndefined();
  });
});

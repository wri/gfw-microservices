import { filterPerStatus } from '../../js/components/B2bSharingPanel/B2BConnection.utils';

const defaultData = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'approved' },
  { id: 3, status: 'rejected' },
];

describe('filterPerStatus', () => {
  it('should return unfiltered data and empty filter when status matches filter', () => {
    const status = 'approved';
    const filter = 'approved';

    const result = filterPerStatus(defaultData, status, filter);

    expect(result).toEqual({ data: defaultData, filter: '' });
  });

  it('should return filtered data and the matching status as filter', () => {
    const status = 'approved';
    const filter = 'pending';

    const result = filterPerStatus(defaultData, status, filter);

    const expectedData = [{ id: 1, status: 'pending' }];
    expect(result).toEqual({ data: expectedData, filter: 'pending' });
  });

  it('should return empty data and empty filter when there is no match', () => {
    const status = 'approved';
    const filter = 'otherStatus';

    const result = filterPerStatus(defaultData, status, filter);

    expect(result).toEqual({ data: [], filter: 'otherStatus' });
  });
});

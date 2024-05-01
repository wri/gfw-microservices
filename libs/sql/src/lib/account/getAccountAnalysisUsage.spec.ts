jest.mock('../util/sql.utils', () => ({
  SQLUtils: {
    queryDB: async () => {
      return [
        {
          total_area_analyzed: '1',
          max_area_analyzed: '2',
        },
      ];
    },
  },
}));

import { getAccountAnalysisUsage } from './getAccountAnalysisUsage';
import { expect, describe, it, jest } from '@jest/globals';

describe('getAccountAnalysisUsage', () => {
  it('returns numbers not strings', async () => {
    const res = await getAccountAnalysisUsage({
      startDate: '2025-01-01',
      endDate: '2024-01-02',
      organizationId: 1,
    });
    expect(res).toStrictEqual([
      {
        total_area_analyzed: 1,
        max_area_analyzed: 2,
      },
    ]);
  });
});

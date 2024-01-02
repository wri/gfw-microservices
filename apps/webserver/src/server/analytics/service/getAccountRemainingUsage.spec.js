/**
 * @jest-environment node
 */
const getAccountRemainingUsage = require('./getAccountRemainingUsage');

const { getOrganizationAnalysisUsage } = require('./analytics.service');

import { getAccountLimits } from '@wri-monorepos/subscription';

const { calculateRemainingUsage } = require('../../../config/privateutils/limits.utils');

jest.mock('@wri-monorepos/subscription');
jest.mock('./analytics.service', () => ({
  getOrganizationAnalysisUsage: jest.fn(),
}));
jest.mock('../../../config/privateutils/limits.utils');
jest.mock('../../../config/privateutils/sql.utils');

beforeEach(() => {
  // Reset mock functions and clear any previous calls
  jest.clearAllMocks();
});

describe('getAccountRemainingUsage', () => {
  it('should calculate remaining usage correctly', async () => {
    getOrganizationAnalysisUsage.mockResolvedValue([
      {
        total_area_analyzed: 0,
        max_area_analyzed: 0,
        number_of_lists_analyzed: 0,
        organization_id: 1,
        organization_name: 'DevCo',
      },
    ]);

    getAccountLimits.mockResolvedValue({
      MaxAreaAnalyzeablePerYear: 129852282,
      MaxAreaPerList: 100100100,
      OrgID: 1,
      OrgType: null,
      organization_name: 'DevCo',
      status_name: null,
    });

    calculateRemainingUsage.mockReturnValue(129852282);

    const result = await getAccountRemainingUsage({
      organizationId: 1,
      subscriptionStatusId: 2,
      organizationActivatedTime: '2018-10-02',
    });

    // main
    expect(result).toEqual(129852282);
    expect(getOrganizationAnalysisUsage).toHaveBeenCalled();
    expect(getAccountLimits).toHaveBeenCalled();
    expect(getOrganizationAnalysisUsage).toHaveBeenCalled();
    expect(getAccountLimits).toHaveBeenCalledWith(1, 2);
  });
});

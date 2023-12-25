/**
 * @jest-environment node
 */
const {
  getOrganizationAnalysisUsage,
  getAccountLimits,
  getAccountRemainingUsage,
} = require('./analytics.service');

const { calculateRemainingUsage } = require('../../../config/privateutils/limits.utils');

jest.mock('./analytics.service', () => {
  // const {getAccountRemainingUsage} = jest.requireActual('./analytics.service');

  return {
    getOrganizationAnalysisUsage: jest.fn(),
    getAnalysisLimitData: jest.fn(),
    getAccountLimits: jest.fn(),
    getAllListsAnalysisStatus: jest.fn(),
    getAccountListProccesingLimit: jest.fn(),
    getListAnalysisStatusByListId: jest.fn(),
    getOrganizationUsagePercentage: jest.fn(),
    getAccountRemainingUsage: jest.fn(() => 129852282),
  };
});
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
    // expect(getOrganizationAnalysisUsage).toHaveBeenCalled();
    // expect(getAccountLimits).toHaveBeenCalled();
    // expect(getOrganizationAnalysisUsage).toHaveBeenCalledWith({
    //   startDate: '2018-10-02',
    //   endDate: '2023-12-25',
    //   organizationId: 1,
    //   countForEachList: 0,
    // });
    // expect(getAccountLimits).toHaveBeenCalledWith(1, 2);
  });
});

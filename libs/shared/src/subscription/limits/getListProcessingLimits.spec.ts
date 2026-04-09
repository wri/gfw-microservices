import { getListProcessingLimits } from './getListProcessingLimits';
import { getAccountSubscriptionData, calculateListProcessingLimit } from '../utils';
import { AnalysisLimit, OrganizationAnalysisUsage } from '@wri-monorepos/sql';

jest.mock('../utils', () => ({
  getAccountSubscriptionData: jest.fn(),
  calculateListProcessingLimit: jest.fn(),
}));

describe('getListProcessingLimits', () => {
  const mockGetAccountSubscriptionData = getAccountSubscriptionData as jest.Mock;
  const mockCalculateListProcessingLimit = calculateListProcessingLimit as jest.Mock;

  const mockAccountUsage: OrganizationAnalysisUsage = {
    total_area_analyzed: 100,
    max_area_analyzed: 500,
    number_of_lists_analyzed: 1,
    locations_analyzed: 50,
    total_tokens: 0,
    organization_id: 1,
    organization_name: 'TestOrg',
  };

  const mockAccountLimits: AnalysisLimit = {
    MaxAreaAnalyzeablePerYear: 1000,
    MaxAreaPerList: 500,
    max_locations_per_year: 200,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAccountSubscriptionData.mockResolvedValue({
      accountUsage: mockAccountUsage,
      accountLimits: mockAccountLimits,
      organizationRenewalTime: '2025-01-01T00:00:00.000Z',
    });

    mockCalculateListProcessingLimit.mockResolvedValue(500);
  });

  it('should call getAccountSubscriptionData with correct parameters', async () => {
    await getListProcessingLimits({
      organizationId: 1,
      organizationType: 5,
    });

    expect(mockGetAccountSubscriptionData).toHaveBeenCalledWith({
      organizationId: 1,
      subscriptionStatusId: 5,
    });
  });

  it('should call calculateListProcessingLimit with correct parameters', async () => {
    const result = await getListProcessingLimits({
      organizationId: 1,
      organizationType: 5,
    });

    expect(mockCalculateListProcessingLimit).toHaveBeenCalledWith({
      accountLimits: expect.objectContaining({
        MaxAreaAnalyzeablePerYear: 1000,
        MaxAreaPerList: 500,
      }),
      accountUsage: expect.objectContaining({
        total_area_analyzed: 100,
        organization_id: 1,
      }),
    });
    expect(result).toBe(500);
  });

  it('should return the result from calculateListProcessingLimit', async () => {
    mockCalculateListProcessingLimit.mockResolvedValue(250);

    const result = await getListProcessingLimits({
      organizationId: 2,
      organizationType: 3,
    });

    expect(result).toBe(250);
  });
});

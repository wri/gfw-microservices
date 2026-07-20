import {
  getAccountAnalysisUsageByAnalysisType,
  getChargeRates,
  getListLocationsCountById,
  findApplicableRate,
} from '@wri-monorepos/sql';
import { checkLocationProcessingLimit } from './checkLocationProcessingLimit';
import { getAccountSubscriptionData } from '../utils';
import { calculateAccountSubscriptionDates } from '../utils/accountSubscriptionDates';

jest.mock('@wri-monorepos/sql', () => ({
  getListLocationsCountById: jest.fn(),
  getAccountAnalysisUsageByAnalysisType: jest.fn(),
  getChargeRates: jest.fn(),
  findApplicableRate: jest.fn(),
}));

jest.mock('../utils', () => ({
  getAccountSubscriptionData: jest.fn(),
}));

jest.mock('../utils/accountSubscriptionDates', () => ({
  calculateAccountSubscriptionDates: jest.fn(),
}));

type MockedFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

describe('checkLocationProcessingLimit', () => {
  const mockGetAccountSubscriptionData = getAccountSubscriptionData as MockedFunction<
    typeof getAccountSubscriptionData
  >;
  const mockGetListLocationsCountById = getListLocationsCountById as MockedFunction<
    typeof getListLocationsCountById
  >;
  const mockGetAccountAnalysisUsageByAnalysisType =
    getAccountAnalysisUsageByAnalysisType as MockedFunction<
      typeof getAccountAnalysisUsageByAnalysisType
    >;
  const mockGetChargeRates = getChargeRates as MockedFunction<typeof getChargeRates>;
  const mockFindApplicableRate = findApplicableRate as MockedFunction<typeof findApplicableRate>;
  const mockCalculateAccountSubscriptionDates = calculateAccountSubscriptionDates as MockedFunction<
    typeof calculateAccountSubscriptionDates
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAccountSubscriptionData.mockResolvedValue({
      accountUsage: { locations_analyzed: 0 },
      accountLimits: { max_locations_per_year: 0 },
      organizationRenewalTime: '2025-01-01T00:00:00.000Z',
    } as any);

    mockCalculateAccountSubscriptionDates.mockReturnValue({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      subscriptionYearEnd: 'December 31, 2025',
    });

    mockGetListLocationsCountById.mockResolvedValue(0);
    mockGetAccountAnalysisUsageByAnalysisType.mockResolvedValue([]);
    mockGetChargeRates.mockResolvedValue([]);
    mockFindApplicableRate.mockImplementation((rates, analysisType, analysisEndTime) => {
      const applicableRates = rates.filter(
        (rate) =>
          rate.analysisType === analysisType &&
          new Date(rate.effectiveDate).getTime() <= analysisEndTime.getTime()
      );

      if (applicableRates.length === 0) {
        return null;
      }

      return applicableRates.sort(
        (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
      )[0];
    });
  });

  it('enforces limits when analysisTypesToProcess is empty (default case)', async () => {
    mockGetAccountSubscriptionData.mockResolvedValue({
      accountUsage: { locations_analyzed: 10 },
      accountLimits: { max_locations_per_year: 12 },
      organizationRenewalTime: '2025-01-01T00:00:00.000Z',
    } as any);

    mockGetListLocationsCountById.mockResolvedValue(5);

    const result = await checkLocationProcessingLimit({
      listId: 1,
      orgDbName: 'orgDb',
      organizationId: 10,
      subscriptionStatusId: 5,
      analysisTypesToProcess: {},
    });

    expect(result).toBe(true);
    expect(mockGetAccountSubscriptionData).toHaveBeenCalled();
  });

  it('returns true when max locations per year would be exceeded', async () => {
    mockGetAccountSubscriptionData.mockResolvedValue({
      accountUsage: { locations_analyzed: 10 },
      accountLimits: { max_locations_per_year: 12 },
      organizationRenewalTime: '2025-01-01T00:00:00.000Z',
    } as any);

    mockGetListLocationsCountById.mockResolvedValue(5);

    const result = await checkLocationProcessingLimit({
      listId: 1,
      orgDbName: 'orgDb',
      organizationId: 10,
      subscriptionStatusId: 5,
      analysisTypesToProcess: { AFI: true },
    });

    expect(result).toBe(true);
  });

  it('returns true when token limit would be exceeded', async () => {
    mockGetAccountSubscriptionData.mockResolvedValue({
      accountUsage: { locations_analyzed: 10 },
      accountLimits: { max_locations_per_year: 100, tokens_per_year: 100 },
      organizationRenewalTime: '2025-01-01T00:00:00.000Z',
    } as any);

    mockGetListLocationsCountById.mockResolvedValue(5);

    mockGetAccountAnalysisUsageByAnalysisType.mockResolvedValue([{ total_tokens: 90 }] as any);

    const effectiveDate = new Date('2025-01-01T00:00:00.000Z');
    mockGetChargeRates.mockResolvedValue([
      { analysisType: 'AFI', effectiveDate, locationRate: 2, listRate: 5 },
    ] as any);

    const result = await checkLocationProcessingLimit({
      listId: 1,
      orgDbName: 'orgDb',
      organizationId: 10,
      subscriptionStatusId: 5,
      analysisTypesToProcess: { AFI: true },
    });

    expect(result).toBe(true);
  });

  it('returns false when token limit is not exceeded', async () => {
    mockGetAccountSubscriptionData.mockResolvedValue({
      accountUsage: { locations_analyzed: 10 },
      accountLimits: { max_locations_per_year: 100, tokens_per_year: 120 },
      organizationRenewalTime: '2025-01-01T00:00:00.000Z',
    } as any);

    mockGetListLocationsCountById.mockResolvedValue(5);

    mockGetAccountAnalysisUsageByAnalysisType.mockResolvedValue([{ total_tokens: 90 }] as any);

    const effectiveDate = new Date('2025-01-01T00:00:00.000Z');
    mockGetChargeRates.mockResolvedValue([
      { analysisType: 'AFI', effectiveDate, locationRate: 1, listRate: 5 },
    ] as any);

    const result = await checkLocationProcessingLimit({
      listId: 1,
      orgDbName: 'orgDb',
      organizationId: 10,
      subscriptionStatusId: 5,
      analysisTypesToProcess: { AFI: true },
    });

    expect(result).toBe(false);
  });
});

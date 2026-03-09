import { calculateListProcessingLimit } from './calculateListProcessingLimit';
import {
  AnalysisLimit,
  OrganizationAnalysisUsage,
  getHALimitForCurrentYear,
} from '@wri-monorepos/sql';
import { featureFlagsService } from '../../lib/utils/feature.flag.service';

jest.mock('@wri-monorepos/sql', () => ({
  ...jest.requireActual('@wri-monorepos/sql'),
  getHALimitForCurrentYear: jest.fn(),
}));

jest.mock('../../lib/utils/feature.flag.service', () => ({
  featureFlagsService: jest.fn(),
}));

describe('calculateListProcessingLimit', () => {
  const mockGetHALimitForCurrentYear = getHALimitForCurrentYear as jest.Mock;
  const mockFeatureFlagsService = featureFlagsService as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: tokenization disabled
    mockFeatureFlagsService.mockResolvedValue({
      getFeatureFlagsForCurrentOrg: jest.fn().mockResolvedValue([]),
    });
  });

  describe('when tokenization is disabled', () => {
    it('should return the value of available area remaining when its smaller than MaxAreaPerList', async () => {
      const accountLimits: AnalysisLimit = {
        MaxAreaAnalyzeablePerYear: 1000,
        MaxAreaPerList: 900,
      };

      const accountUsage: OrganizationAnalysisUsage = {
        total_area_analyzed: 300,
        max_area_analyzed: 800,
        number_of_lists_analyzed: 2,
        locations_analyzed: 100,
        total_tokens: 0,
        organization_id: 1,
        organization_name: 'TestOrg',
      };

      const result = await calculateListProcessingLimit({
        accountLimits,
        accountUsage,
        organizationId: 1,
      });

      expect(result).toBe(700);
      expect(mockGetHALimitForCurrentYear).not.toHaveBeenCalled();
    });

    it('should return the value of MaxAreaPerList when its smaller than available area remaining', async () => {
      const accountLimits: AnalysisLimit = {
        MaxAreaAnalyzeablePerYear: 1000,
        MaxAreaPerList: 500,
      };

      const accountUsage: OrganizationAnalysisUsage = {
        total_area_analyzed: 300,
        max_area_analyzed: 800,
        number_of_lists_analyzed: 2,
        locations_analyzed: 100,
        total_tokens: 0,
        organization_id: 1,
        organization_name: 'TestOrg',
      };

      const result = await calculateListProcessingLimit({
        accountLimits,
        accountUsage,
        organizationId: 1,
      });

      expect(result).toBe(500);
      expect(mockGetHALimitForCurrentYear).not.toHaveBeenCalled();
    });
  });

  describe('when tokenization is enabled', () => {
    beforeEach(() => {
      mockFeatureFlagsService.mockResolvedValue({
        getFeatureFlagsForCurrentOrg: jest
          .fn()
          .mockResolvedValue([{ flagId: 'Tokenization', flagState: true }]),
      });
    });

    it('should use haLimitPerYear instead of MaxAreaAnalyzeablePerYear', async () => {
      const accountLimits: AnalysisLimit = {
        MaxAreaAnalyzeablePerYear: 1000, // This should be ignored
        MaxAreaPerList: 900,
      };

      const accountUsage: OrganizationAnalysisUsage = {
        total_area_analyzed: 300,
        max_area_analyzed: 800,
        number_of_lists_analyzed: 2,
        locations_analyzed: 100,
        total_tokens: 0,
        organization_id: 1,
        organization_name: 'TestOrg',
      };

      // When tokenization is enabled, use 800 as per-year limit
      mockGetHALimitForCurrentYear.mockResolvedValue(800);

      const result = await calculateListProcessingLimit({
        accountLimits,
        accountUsage,
        organizationId: 1,
      });

      // 800 (haLimitPerYear) - 300 (total_area_analyzed) = 500
      // Min(500, 900) = 500
      expect(result).toBe(500);
      expect(mockGetHALimitForCurrentYear).toHaveBeenCalledWith(1);
    });

    it('should return MaxAreaPerList when it is smaller than available area with tokenized limit', async () => {
      const accountLimits: AnalysisLimit = {
        MaxAreaAnalyzeablePerYear: 1000,
        MaxAreaPerList: 200,
      };

      const accountUsage: OrganizationAnalysisUsage = {
        total_area_analyzed: 100,
        max_area_analyzed: 800,
        number_of_lists_analyzed: 2,
        locations_analyzed: 100,
        total_tokens: 0,
        organization_id: 1,
        organization_name: 'TestOrg',
      };

      mockGetHALimitForCurrentYear.mockResolvedValue(500);

      const result = await calculateListProcessingLimit({
        accountLimits,
        accountUsage,
        organizationId: 1,
      });

      // 500 (haLimitPerYear) - 100 (total_area_analyzed) = 400
      // Min(400, 200) = 200
      expect(result).toBe(200);
    });
  });

  describe('when feature flag service fails', () => {
    it('should fall back to using MaxAreaAnalyzeablePerYear', async () => {
      mockFeatureFlagsService.mockRejectedValue(new Error('Service unavailable'));

      const accountLimits: AnalysisLimit = {
        MaxAreaAnalyzeablePerYear: 1000,
        MaxAreaPerList: 900,
      };

      const accountUsage: OrganizationAnalysisUsage = {
        total_area_analyzed: 300,
        max_area_analyzed: 800,
        number_of_lists_analyzed: 2,
        locations_analyzed: 100,
        total_tokens: 0,
        organization_id: 1,
        organization_name: 'TestOrg',
      };

      const result = await calculateListProcessingLimit({
        accountLimits,
        accountUsage,
        organizationId: 1,
      });

      expect(result).toBe(700);
      expect(mockGetHALimitForCurrentYear).not.toHaveBeenCalled();
    });
  });
});

import { ExecutionContext } from '@nestjs/common';
import { FeatureFlagEnabledGuard, FeatureFlagCheckGuard } from './feature.flag.enabled.guard';
import { featureFlagsService } from '@wri-monorepos/shared';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

interface RequestBody {
  client_store?: string;
  clientDatabase?: string;
  client_database?: string;
}

interface FeatureFlagRequest {
  body: RequestBody;
  featureFlag?: { enabled: boolean };
}

type MockHttpArgumentsHost = HttpArgumentsHost & {
  getRequest: () => FeatureFlagRequest;
};

type MockExecutionContext = ExecutionContext & {
  switchToHttp: () => MockHttpArgumentsHost;
};

jest.mock('@wri-monorepos/shared', () => ({
  featureFlagsService: jest.fn(),
}));

describe('Feature Flag Guards', () => {
  let mockExecutionContext: MockExecutionContext;
  let mockRequest: FeatureFlagRequest;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    const mockHttpArgumentsHost: MockHttpArgumentsHost = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as MockExecutionContext;

    jest.clearAllMocks();
  });

  describe('FeatureFlagEnabledGuard', () => {
    let guard: FeatureFlagEnabledGuard;

    beforeEach(() => {
      guard = new FeatureFlagEnabledGuard('test-flag');
    });

    it('should return false when client store database is not provided', async () => {
      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
      expect(mockRequest.featureFlag).toEqual({ enabled: false });
    });

    it('should set feature flag enabled when flag is enabled for organization', async () => {
      mockRequest.body.client_store = 'test-store';

      const mockFeatureFlagsService = {
        getFeatureFlagsForCurrentOrg: jest
          .fn()
          .mockResolvedValue([{ flagId: 'test-flag', flagState: true }]),
        getClientIdByClientStoreDatabaseName: jest.fn().mockResolvedValue('org-123'),
      };

      (featureFlagsService as jest.Mock).mockResolvedValue(mockFeatureFlagsService);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.featureFlag).toEqual({ enabled: true });
      expect(mockFeatureFlagsService.getClientIdByClientStoreDatabaseName).toHaveBeenCalledWith(
        'test-store'
      );
      expect(mockFeatureFlagsService.getFeatureFlagsForCurrentOrg).toHaveBeenCalledWith('org-123');
    });

    it('should set feature flag disabled when flag is not enabled for organization', async () => {
      mockRequest.body.client_store = 'test-store';

      const mockFeatureFlagsService = {
        getFeatureFlagsForCurrentOrg: jest
          .fn()
          .mockResolvedValue([{ flagId: 'test-flag', flagState: false }]),
        getClientIdByClientStoreDatabaseName: jest.fn().mockResolvedValue('org-123'),
      };

      (featureFlagsService as jest.Mock).mockResolvedValue(mockFeatureFlagsService);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.featureFlag).toEqual({ enabled: false });
    });

    it('should handle clientDatabase and client_database fields', async () => {
      mockRequest.body.clientDatabase = 'test-db';

      const mockFeatureFlagsService = {
        getFeatureFlagsForCurrentOrg: jest
          .fn()
          .mockResolvedValue([{ flagId: 'test-flag', flagState: true }]),
        getClientIdByClientStoreDatabaseName: jest.fn().mockResolvedValue('org-123'),
      };

      (featureFlagsService as jest.Mock).mockResolvedValue(mockFeatureFlagsService);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest.featureFlag).toEqual({ enabled: true });
      expect(mockFeatureFlagsService.getClientIdByClientStoreDatabaseName).toHaveBeenCalledWith(
        'test-db'
      );
    });
  });

  describe('FeatureFlagCheckGuard', () => {
    let guard: FeatureFlagCheckGuard;

    beforeEach(() => {
      guard = new FeatureFlagCheckGuard('test-flag');
    });

    it('should return false when client store database is not provided', async () => {
      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(false);
    });

    it('should return true when flag is enabled for organization', async () => {
      mockRequest.body.client_store = 'test-store';

      const mockFeatureFlagsService = {
        getFeatureFlagsForCurrentOrg: jest
          .fn()
          .mockResolvedValue([{ flagId: 'test-flag', flagState: true }]),
        getClientIdByClientStoreDatabaseName: jest.fn().mockResolvedValue('org-123'),
      };

      (featureFlagsService as jest.Mock).mockResolvedValue(mockFeatureFlagsService);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockFeatureFlagsService.getClientIdByClientStoreDatabaseName).toHaveBeenCalledWith(
        'test-store'
      );
      expect(mockFeatureFlagsService.getFeatureFlagsForCurrentOrg).toHaveBeenCalledWith('org-123');
    });

    it('should return false when flag is not enabled for organization', async () => {
      mockRequest.body.client_store = 'test-store';

      const mockFeatureFlagsService = {
        getFeatureFlagsForCurrentOrg: jest
          .fn()
          .mockResolvedValue([{ flagId: 'test-flag', flagState: false }]),
        getClientIdByClientStoreDatabaseName: jest.fn().mockResolvedValue('org-123'),
      };

      (featureFlagsService as jest.Mock).mockResolvedValue(mockFeatureFlagsService);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });
  });
});

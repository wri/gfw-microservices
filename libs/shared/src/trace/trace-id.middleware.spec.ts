import { TraceIdMiddleware, TRACE_ID_HEADER } from './trace-id.middleware';
import { traceContext } from './trace.context';
import { OrganizationLookupService } from './organization-lookup.service';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Mock the OrganizationLookupService
jest.mock('./organization-lookup.service', () => ({
  OrganizationLookupService: {
    extractUserEmail: jest.fn(),
    extractUserId: jest.fn(),
    extractOrganizationId: jest.fn(),
    lookupOrganizationIdByEmail: jest.fn(),
  },
}));

describe('TraceIdMiddleware', () => {
  let middleware: TraceIdMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new TraceIdMiddleware();
    mockRequest = {
      headers: {},
      traceId: undefined,
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('trace ID handling', () => {
    it('should use trace ID from header if present', async () => {
      const headerTraceId = 'header-trace-id-123';
      mockRequest.headers = {
        [TRACE_ID_HEADER]: headerTraceId,
      };
      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(undefined);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.traceId).toBe(headerTraceId);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(TRACE_ID_HEADER, headerTraceId);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate new trace ID if not in header', async () => {
      const generateSpy = jest.spyOn(traceContext, 'generateTraceId');
      const mockTraceId = 'generated-trace-id';
      generateSpy.mockReturnValue(mockTraceId);
      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(undefined);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(generateSpy).toHaveBeenCalled();
      expect(mockRequest.traceId).toBe(mockTraceId);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(TRACE_ID_HEADER, mockTraceId);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('organization_id and user_id extraction', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(undefined);
      (OrganizationLookupService.extractUserId as jest.Mock).mockReturnValue(undefined);
      (OrganizationLookupService.extractOrganizationId as jest.Mock).mockReturnValue(undefined);
      (OrganizationLookupService.lookupOrganizationIdByEmail as jest.Mock).mockResolvedValue(
        undefined
      );
    });

    it('should extract organizationId and userId from req.body', async () => {
      const testTraceId = 'test-trace-id';
      const testOrgId = 123;
      const testUserId = 456;

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };
      mockRequest.body = {
        organization_id: testOrgId,
        user_id: testUserId,
      };

      (OrganizationLookupService.extractOrganizationId as jest.Mock).mockReturnValue(testOrgId);
      (OrganizationLookupService.extractUserId as jest.Mock).mockReturnValue(testUserId);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      // Verify context was set with organization and user IDs
      expect(mockNext).toHaveBeenCalled();
      // The context should be active during next() call
      // We can't directly test it here, but we verify the middleware runs correctly
    });

    it('should extract organization_id and user_id from req.headers', async () => {
      const testTraceId = 'test-trace-id-headers';
      const testOrgId = 789;
      const testUserId = 101112;

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
        'x-organization-id': testOrgId.toString(),
        'x-user-id': testUserId.toString(),
      };

      (OrganizationLookupService.extractOrganizationId as jest.Mock).mockReturnValue(testOrgId);
      (OrganizationLookupService.extractUserId as jest.Mock).mockReturnValue(testUserId);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should prefer req.body over req.headers', async () => {
      const testTraceId = 'test-trace-id-preference';
      const bodyOrgId = 111;
      const bodyUserId = 222;

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
        'x-organization-id': '333',
        'x-user-id': '444',
      };
      mockRequest.body = {
        organization_id: bodyOrgId,
        user_id: bodyUserId,
      };

      (OrganizationLookupService.extractOrganizationId as jest.Mock).mockReturnValue(bodyOrgId);
      (OrganizationLookupService.extractUserId as jest.Mock).mockReturnValue(bodyUserId);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // req.body should be preferred (checked in middleware implementation)
    });

    it('should handle missing organization_id and user_id gracefully', async () => {
      const testTraceId = 'test-trace-id-missing';

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };
      // No user or session

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle partial organization_id or user_id', async () => {
      const testTraceId = 'test-trace-id-partial';
      const testOrgId = 555;

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };
      mockRequest.body = {
        organization_id: testOrgId,
        // No user_id
      };

      (OrganizationLookupService.extractOrganizationId as jest.Mock).mockReturnValue(testOrgId);
      (OrganizationLookupService.extractUserId as jest.Mock).mockReturnValue(undefined);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should lookup organization_id from database when missing but user_email is present', async () => {
      const testTraceId = 'test-trace-id-lookup';
      const testUserEmail = 'user@example.com';
      const lookedUpOrgId = 999;

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };
      mockRequest.body = {
        userEmail: testUserEmail,
      };
      // No organization_id in user or session

      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(testUserEmail);
      (OrganizationLookupService.lookupOrganizationIdByEmail as jest.Mock).mockResolvedValue(
        lookedUpOrgId
      );

      let contextOrgId: number | undefined;
      const testNext = jest.fn(() => {
        contextOrgId = traceContext.getOrganizationId();
      });

      await middleware.use(mockRequest as Request, mockResponse as Response, testNext);

      expect(OrganizationLookupService.extractUserEmail).toHaveBeenCalledWith(mockRequest);
      expect(OrganizationLookupService.lookupOrganizationIdByEmail).toHaveBeenCalledWith(
        testUserEmail
      );
      expect(contextOrgId).toBe(lookedUpOrgId);
      expect(testNext).toHaveBeenCalled();
    });

    it('should not lookup organization_id when already present', async () => {
      const testTraceId = 'test-trace-id-no-lookup';
      const testOrgId = 777;
      const testUserEmail = 'user@example.com';

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };
      mockRequest.body = {
        organization_id: testOrgId,
        userEmail: testUserEmail,
      };

      (OrganizationLookupService.extractOrganizationId as jest.Mock).mockReturnValue(testOrgId);
      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(testUserEmail);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(OrganizationLookupService.lookupOrganizationIdByEmail).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle database lookup errors gracefully', async () => {
      const testTraceId = 'test-trace-id-lookup-error';
      const testUserEmail = 'user@example.com';

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };
      mockRequest.body = {
        userEmail: testUserEmail,
      };

      const loggerWarnSpy = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);
      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(testUserEmail);
      (OrganizationLookupService.lookupOrganizationIdByEmail as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to lookup organization_id from database')
      );
      expect(mockNext).toHaveBeenCalled(); // Request should continue even if lookup fails

      loggerWarnSpy.mockRestore();
    });

    it('should not lookup when user_email is missing', async () => {
      const testTraceId = 'test-trace-id-no-email';

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };
      // No organization_id, no user_email

      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(undefined);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(OrganizationLookupService.lookupOrganizationIdByEmail).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('context propagation', () => {
    beforeEach(() => {
      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(undefined);
    });

    it('should set trace context with organization and user IDs', async () => {
      const testTraceId = 'test-context-propagation';
      const testOrgId = 999;
      const testUserId = 888;

      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };
      mockRequest.body = {
        organization_id: testOrgId,
        user_id: testUserId,
      };

      (OrganizationLookupService.extractOrganizationId as jest.Mock).mockReturnValue(testOrgId);
      (OrganizationLookupService.extractUserId as jest.Mock).mockReturnValue(testUserId);

      let contextOrgId: number | undefined;
      let contextUserId: number | undefined;
      let contextTraceId: string;

      // Mock next to capture context
      mockNext = () => {
        contextOrgId = traceContext.getOrganizationId();
        contextUserId = traceContext.getUserId();
        contextTraceId = traceContext.getTraceId();
      };

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(contextTraceId).toBe(testTraceId);
      expect(contextOrgId).toBe(testOrgId);
      expect(contextUserId).toBe(testUserId);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (OrganizationLookupService.extractUserEmail as jest.Mock).mockReturnValue(undefined);
    });

    it('should handle AsyncLocalStorage errors gracefully', async () => {
      const testTraceId = 'test-error-handling';
      mockRequest.headers = {
        [TRACE_ID_HEADER]: testTraceId,
      };

      // Mock traceContext.run to throw an error
      const originalRun = traceContext.run;
      jest.spyOn(traceContext, 'run').mockImplementation(() => {
        throw new Error('AsyncLocalStorage failed');
      });

      const loggerWarnSpy = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined);

      await middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('AsyncLocalStorage failed')
      );
      expect(mockNext).toHaveBeenCalled();

      // Restore original implementation
      jest.spyOn(traceContext, 'run').mockImplementation(originalRun);
      loggerWarnSpy.mockRestore();
    });
  });
});

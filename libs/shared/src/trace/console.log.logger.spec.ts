import { ConsoleLog } from './console.log.logger';
import { traceContext } from './trace.context';

describe('ConsoleLog', () => {
  let logger: ConsoleLog;
  let originalEnv: string | undefined;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('organization_id and user_id in logs', () => {
    it('should include organization_id and user_id in production logs', () => {
      process.env.NODE_ENV = 'production';
      logger = new ConsoleLog();

      const testTraceId = 'test-trace-id-log';
      const testOrgId = 123;
      const testUserId = 456;

      traceContext.run(
        testTraceId,
        () => {
          logger.log('Test message', 'TestContext');
        },
        testOrgId,
        testUserId
      );

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.traceId).toBe(testTraceId);
      expect(logEntry.organization_id).toBe(testOrgId);
      expect(logEntry.user_id).toBe(testUserId);
      expect(logEntry.message).toBe('Test message');
    });

    it('should include organization_id when user_id is missing', () => {
      process.env.NODE_ENV = 'production';
      logger = new ConsoleLog();

      const testTraceId = 'test-trace-id-org-only';
      const testOrgId = 789;

      traceContext.run(
        testTraceId,
        () => {
          logger.log('Test message', 'TestContext');
        },
        testOrgId
      );

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.organization_id).toBe(testOrgId);
      expect(logEntry.user_id).toBeUndefined();
    });

    it('should include user_id when organization_id is missing', () => {
      process.env.NODE_ENV = 'production';
      logger = new ConsoleLog();

      const testTraceId = 'test-trace-id-user-only';
      const testUserId = 101112;

      traceContext.run(
        testTraceId,
        () => {
          logger.log('Test message', 'TestContext');
        },
        undefined,
        testUserId
      );

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.organization_id).toBeUndefined();
      expect(logEntry.user_id).toBe(testUserId);
    });

    it('should not include organization_id or user_id when not set', () => {
      process.env.NODE_ENV = 'production';
      logger = new ConsoleLog();

      const testTraceId = 'test-trace-id-no-ids';

      traceContext.run(testTraceId, () => {
        logger.log('Test message', 'TestContext');
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.traceId).toBe(testTraceId);
      expect(logEntry.organization_id).toBeUndefined();
      expect(logEntry.user_id).toBeUndefined();
    });

    it('should include organization_id and user_id in development logs', () => {
      process.env.NODE_ENV = 'development';
      logger = new ConsoleLog();

      const testTraceId = 'test-trace-id-dev';
      const testOrgId = 2001;
      const testUserId = 2002;

      traceContext.run(
        testTraceId,
        () => {
          logger.log('Test message', 'TestContext');
        },
        testOrgId,
        testUserId
      );

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];

      // Development logs are formatted differently, but should still contain the info
      expect(logCall).toContain(`[traceId:${testTraceId}]`);
      expect(logCall).toContain(`[orgId:${testOrgId}]`);
      expect(logCall).toContain(`[userId:${testUserId}]`);
    });

    it('should preserve organization_id and user_id in background task logs', async () => {
      process.env.NODE_ENV = 'production';
      logger = new ConsoleLog();

      const originalTraceId = 'original-trace';
      const originalOrgId = 3001;
      const originalUserId = 3002;

      // Simulate background task scenario
      await traceContext.run(
        originalTraceId,
        async () => {
          const traceIdForWorker = traceContext.getTraceId();
          const orgIdForWorker = traceContext.getOrganizationId();
          const userIdForWorker = traceContext.getUserId();

          // Simulate worker execution
          await traceContext.run(
            traceIdForWorker,
            async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              logger.log('Background task log', 'WorkerContext');
            },
            orgIdForWorker,
            userIdForWorker
          );
        },
        originalOrgId,
        originalUserId
      );

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.traceId).toBe(originalTraceId);
      expect(logEntry.organization_id).toBe(originalOrgId);
      expect(logEntry.user_id).toBe(originalUserId);
    });

    it('should include organization_id and user_id in error logs', () => {
      process.env.NODE_ENV = 'production';
      logger = new ConsoleLog();

      const testTraceId = 'test-trace-id-error';
      const testOrgId = 4001;
      const testUserId = 4002;

      traceContext.run(
        testTraceId,
        () => {
          logger.error('Error message', 'ErrorContext');
        },
        testOrgId,
        testUserId
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.traceId).toBe(testTraceId);
      expect(logEntry.organization_id).toBe(testOrgId);
      expect(logEntry.user_id).toBe(testUserId);
      expect(logEntry.level).toBe('ERROR');
    });

    it('should maintain separate organization_id and user_id for concurrent requests', async () => {
      process.env.NODE_ENV = 'production';
      logger = new ConsoleLog();

      const traceId1 = 'trace-concurrent-1';
      const orgId1 = 5001;
      const userId1 = 5002;

      const traceId2 = 'trace-concurrent-2';
      const orgId2 = 5003;
      const userId2 = 5004;

      await Promise.all([
        traceContext.run(
          traceId1,
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            logger.log('Message from request 1', 'Context1');
          },
          orgId1,
          userId1
        ),
        traceContext.run(
          traceId2,
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            logger.log('Message from request 2', 'Context2');
          },
          orgId2,
          userId2
        ),
      ]);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);

      const logEntries = consoleLogSpy.mock.calls.map((call) => JSON.parse(call[0]));

      const entry1 = logEntries.find((e) => e.traceId === traceId1);
      const entry2 = logEntries.find((e) => e.traceId === traceId2);

      expect(entry1?.organization_id).toBe(orgId1);
      expect(entry1?.user_id).toBe(userId1);
      expect(entry2?.organization_id).toBe(orgId2);
      expect(entry2?.user_id).toBe(userId2);
    });
  });
});

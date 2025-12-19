import { traceContext } from './trace.context';

describe('TraceContextService', () => {
  beforeEach(() => {
    // Clear any existing context before each test
    // Note: We can't directly clear AsyncLocalStorage, but we can ensure
    // we're starting fresh by not having any active context
  });

  describe('getTraceId', () => {
    it('should return empty string when no context is active', () => {
      const traceId = traceContext.getTraceId();
      expect(traceId).toBe('');
    });

    it('should return trace ID when context is active', () => {
      const testTraceId = 'test-trace-id-123';
      let capturedTraceId = '';

      traceContext.run(testTraceId, () => {
        capturedTraceId = traceContext.getTraceId();
      });

      expect(capturedTraceId).toBe(testTraceId);
    });

    it('should return empty string after context exits', () => {
      const testTraceId = 'test-trace-id-456';

      traceContext.run(testTraceId, () => {
        // Context is active here
        expect(traceContext.getTraceId()).toBe(testTraceId);
      });

      // Context should be cleared after run completes
      expect(traceContext.getTraceId()).toBe('');
    });
  });

  describe('run', () => {
    it('should execute function with trace context', () => {
      const testTraceId = 'test-trace-id-789';
      let executed = false;
      let traceIdInContext = '';

      traceContext.run(testTraceId, () => {
        executed = true;
        traceIdInContext = traceContext.getTraceId();
      });

      expect(executed).toBe(true);
      expect(traceIdInContext).toBe(testTraceId);
    });

    it('should return value from function', () => {
      const testTraceId = 'test-trace-id-return';
      const result = traceContext.run(testTraceId, () => {
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('should handle async functions', async () => {
      const testTraceId = 'test-trace-id-async';
      let traceIdInAsync = '';

      await traceContext.run(testTraceId, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        traceIdInAsync = traceContext.getTraceId();
      });

      expect(traceIdInAsync).toBe(testTraceId);
    });
  });

  describe('isolation between concurrent contexts', () => {
    it('should maintain separate trace IDs for concurrent operations', async () => {
      const traceId1 = 'trace-id-1';
      const traceId2 = 'trace-id-2';
      const traceId3 = 'trace-id-3';

      const results: Array<{ traceId: string; order: number }> = [];

      // Simulate concurrent requests
      const promises = [
        traceContext.run(traceId1, async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          results.push({ traceId: traceContext.getTraceId(), order: 1 });
        }),
        traceContext.run(traceId2, async () => {
          await new Promise((resolve) => setTimeout(resolve, 30));
          results.push({ traceId: traceContext.getTraceId(), order: 2 });
        }),
        traceContext.run(traceId3, async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          results.push({ traceId: traceContext.getTraceId(), order: 3 });
        }),
      ];

      await Promise.all(promises);

      // Each context should maintain its own trace ID
      expect(results).toHaveLength(3);
      expect(results.find((r) => r.order === 1)?.traceId).toBe(traceId1);
      expect(results.find((r) => r.order === 2)?.traceId).toBe(traceId2);
      expect(results.find((r) => r.order === 3)?.traceId).toBe(traceId3);
    });

    it('should not leak trace IDs between nested contexts', () => {
      const outerTraceId = 'outer-trace-id';
      const innerTraceId = 'inner-trace-id';
      let outerTraceIdInInner = '';
      let innerTraceIdInInner = '';

      traceContext.run(outerTraceId, () => {
        traceContext.run(innerTraceId, () => {
          outerTraceIdInInner = outerTraceId;
          innerTraceIdInInner = traceContext.getTraceId();
        });

        // After inner context, should return to outer
        const outerAfterInner = traceContext.getTraceId();
        expect(outerAfterInner).toBe(outerTraceId);
      });

      // Inner context should have inner trace ID, not outer
      expect(innerTraceIdInInner).toBe(innerTraceId);
      expect(outerTraceIdInInner).not.toBe(traceContext.getTraceId());
    });

    it('should handle rapid sequential contexts without leakage', () => {
      const traceIds = ['trace-1', 'trace-2', 'trace-3', 'trace-4', 'trace-5'];
      const capturedTraceIds: string[] = [];

      traceIds.forEach((traceId) => {
        traceContext.run(traceId, () => {
          capturedTraceIds.push(traceContext.getTraceId());
        });
      });

      // Each context should capture the correct trace ID
      expect(capturedTraceIds).toEqual(traceIds);

      // After all contexts, should be empty
      expect(traceContext.getTraceId()).toBe('');
    });
  });

  describe('hasActiveContext', () => {
    it('should return false when no context is active', () => {
      expect(traceContext.hasActiveContext()).toBe(false);
    });

    it('should return true when context is active', () => {
      const testTraceId = 'test-trace-id-active';
      let isActiveInContext = false;

      traceContext.run(testTraceId, () => {
        isActiveInContext = traceContext.hasActiveContext();
      });

      expect(isActiveInContext).toBe(true);
      expect(traceContext.hasActiveContext()).toBe(false);
    });
  });

  describe('getContextInfo', () => {
    it('should return null when no context is active', () => {
      const contextInfo = traceContext.getContextInfo();
      expect(contextInfo).toBeNull();
    });

    it('should return context info when active', () => {
      const testTraceId = 'test-trace-id-info';
      let contextInfo: ReturnType<typeof traceContext.getContextInfo> = null;

      traceContext.run(testTraceId, () => {
        contextInfo = traceContext.getContextInfo();
      });

      expect(contextInfo).not.toBeNull();
      expect(contextInfo?.traceId).toBe(testTraceId);
      expect(contextInfo?.requestId).toBeDefined();
      expect(contextInfo?.timestamp).toBeDefined();
    });
  });

  describe('generateTraceId', () => {
    it('should generate unique trace IDs', () => {
      const traceId1 = traceContext.generateTraceId();
      const traceId2 = traceContext.generateTraceId();

      expect(traceId1).toBeDefined();
      expect(traceId2).toBeDefined();
      expect(traceId1).not.toBe(traceId2);
    });

    it('should generate UUID format trace IDs', () => {
      const traceId = traceContext.generateTraceId();
      // UUID v4 format: 8-4-4-4-12 hexadecimal characters
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(traceId).toMatch(uuidRegex);
    });
  });

  describe('real-world scenario: multiple concurrent requests', () => {
    it('should maintain correct trace IDs for multiple concurrent requests', async () => {
      // Simulate the scenario from the bug report:
      // Request 1 with trace ID "test_multi_upload_1_11_11__08_49"
      // Request 2 with trace ID "test_multi_upload_2_11_11__08_49"
      // Both should maintain their own trace IDs

      const traceId1 = 'test_multi_upload_1_11_11__08_49';
      const traceId2 = 'test_multi_upload_2_11_11__08_49';

      const results: Array<{ traceId: string; listName: string }> = [];

      // Simulate both requests processing concurrently
      await Promise.all([
        traceContext.run(traceId1, async () => {
          // Simulate some async work
          await new Promise((resolve) => setTimeout(resolve, 20));
          const currentTraceId = traceContext.getTraceId();
          results.push({
            traceId: currentTraceId,
            listName: 'list-test_multi_upload_1_11_11__08_49',
          });
        }),
        traceContext.run(traceId2, async () => {
          // Simulate some async work
          await new Promise((resolve) => setTimeout(resolve, 20));
          const currentTraceId = traceContext.getTraceId();
          results.push({
            traceId: currentTraceId,
            listName: 'list-test_multi_upload_2_11_11__08_49',
          });
        }),
      ]);

      // Verify each request maintained its correct trace ID
      expect(results).toHaveLength(2);
      const result1 = results.find((r) => r.listName.includes('_1_'));
      const result2 = results.find((r) => r.listName.includes('_2_'));

      expect(result1?.traceId).toBe(traceId1);
      expect(result2?.traceId).toBe(traceId2);
      expect(result1?.traceId).not.toBe(result2?.traceId);
    });
  });

  describe('organizationId and userId', () => {
    it('should store and retrieve organizationId', () => {
      const testTraceId = 'test-trace-id-org';
      const testOrgId = 123;
      let capturedOrgId: number | undefined;

      traceContext.run(
        testTraceId,
        () => {
          capturedOrgId = traceContext.getOrganizationId();
        },
        testOrgId
      );

      expect(capturedOrgId).toBe(testOrgId);
    });

    it('should store and retrieve userId', () => {
      const testTraceId = 'test-trace-id-user';
      const testUserId = 456;
      let capturedUserId: number | undefined;

      traceContext.run(
        testTraceId,
        () => {
          capturedUserId = traceContext.getUserId();
        },
        undefined,
        testUserId
      );

      expect(capturedUserId).toBe(testUserId);
    });

    it('should store and retrieve both organizationId and userId', () => {
      const testTraceId = 'test-trace-id-both';
      const testOrgId = 789;
      const testUserId = 101112;
      let capturedOrgId: number | undefined;
      let capturedUserId: number | undefined;

      traceContext.run(
        testTraceId,
        () => {
          capturedOrgId = traceContext.getOrganizationId();
          capturedUserId = traceContext.getUserId();
        },
        testOrgId,
        testUserId
      );

      expect(capturedOrgId).toBe(testOrgId);
      expect(capturedUserId).toBe(testUserId);
    });

    it('should return undefined when organizationId is not set', () => {
      const testTraceId = 'test-trace-id-no-org';
      let capturedOrgId: number | undefined;

      traceContext.run(testTraceId, () => {
        capturedOrgId = traceContext.getOrganizationId();
      });

      expect(capturedOrgId).toBeUndefined();
    });

    it('should return undefined when userId is not set', () => {
      const testTraceId = 'test-trace-id-no-user';
      let capturedUserId: number | undefined;

      traceContext.run(testTraceId, () => {
        capturedUserId = traceContext.getUserId();
      });

      expect(capturedUserId).toBeUndefined();
    });

    it('should return undefined when context is not active', () => {
      expect(traceContext.getOrganizationId()).toBeUndefined();
      expect(traceContext.getUserId()).toBeUndefined();
    });

    it('should include organizationId and userId in getContextInfo', () => {
      const testTraceId = 'test-trace-id-context-info';
      const testOrgId = 999;
      const testUserId = 888;
      let contextInfo: ReturnType<typeof traceContext.getContextInfo> = null;

      traceContext.run(
        testTraceId,
        () => {
          contextInfo = traceContext.getContextInfo();
        },
        testOrgId,
        testUserId
      );

      expect(contextInfo).not.toBeNull();
      expect(contextInfo?.organizationId).toBe(testOrgId);
      expect(contextInfo?.userId).toBe(testUserId);
    });

    it('should maintain separate organizationId and userId for concurrent contexts', async () => {
      const traceId1 = 'trace-org-1';
      const traceId2 = 'trace-org-2';
      const orgId1 = 111;
      const userId1 = 222;
      const orgId2 = 333;
      const userId2 = 444;

      const results: Array<{
        traceId: string;
        orgId: number | undefined;
        userId: number | undefined;
      }> = [];

      await Promise.all([
        traceContext.run(
          traceId1,
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 20));
            results.push({
              traceId: traceContext.getTraceId(),
              orgId: traceContext.getOrganizationId(),
              userId: traceContext.getUserId(),
            });
          },
          orgId1,
          userId1
        ),
        traceContext.run(
          traceId2,
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 20));
            results.push({
              traceId: traceContext.getTraceId(),
              orgId: traceContext.getOrganizationId(),
              userId: traceContext.getUserId(),
            });
          },
          orgId2,
          userId2
        ),
      ]);

      expect(results).toHaveLength(2);
      const result1 = results.find((r) => r.traceId === traceId1);
      const result2 = results.find((r) => r.traceId === traceId2);

      expect(result1?.orgId).toBe(orgId1);
      expect(result1?.userId).toBe(userId1);
      expect(result2?.orgId).toBe(orgId2);
      expect(result2?.userId).toBe(userId2);
    });

    it('should preserve organizationId and userId in nested contexts', () => {
      const outerTraceId = 'outer-trace';
      const innerTraceId = 'inner-trace';
      const outerOrgId = 555;
      const outerUserId = 666;
      const innerOrgId = 777;
      const innerUserId = 888;

      let innerOrgIdInInner: number | undefined;
      let innerUserIdInInner: number | undefined;

      traceContext.run(
        outerTraceId,
        () => {
          traceContext.run(
            innerTraceId,
            () => {
              // Inner context should have inner values
              innerOrgIdInInner = traceContext.getOrganizationId();
              innerUserIdInInner = traceContext.getUserId();
            },
            innerOrgId,
            innerUserId
          );

          // After inner context, should return to outer
          const outerOrgAfterInner = traceContext.getOrganizationId();
          const outerUserAfterInner = traceContext.getUserId();
          expect(outerOrgAfterInner).toBe(outerOrgId);
          expect(outerUserAfterInner).toBe(outerUserId);
        },
        outerOrgId,
        outerUserId
      );

      expect(innerOrgIdInInner).toBe(innerOrgId);
      expect(innerUserIdInInner).toBe(innerUserId);
    });

    it('should preserve organizationId and userId in background tasks', async () => {
      // Simulate a background task scenario (like worker queue)
      const originalTraceId = 'original-request-trace';
      const originalOrgId = 1001;
      const originalUserId = 1002;

      let backgroundTaskOrgId: number | undefined;
      let backgroundTaskUserId: number | undefined;
      let backgroundTaskTraceId: string;

      // Simulate original request context
      await traceContext.run(
        originalTraceId,
        async () => {
          // Extract context values before queuing
          const traceIdForWorker = traceContext.getTraceId();
          const orgIdForWorker = traceContext.getOrganizationId();
          const userIdForWorker = traceContext.getUserId();

          // Simulate background task execution (worker)
          await traceContext.run(
            traceIdForWorker,
            async () => {
              // Simulate async work in background task
              await new Promise((resolve) => setTimeout(resolve, 10));
              backgroundTaskOrgId = traceContext.getOrganizationId();
              backgroundTaskUserId = traceContext.getUserId();
              backgroundTaskTraceId = traceContext.getTraceId();
            },
            orgIdForWorker,
            userIdForWorker
          );
        },
        originalOrgId,
        originalUserId
      );

      // Verify background task preserved organization and user IDs
      expect(backgroundTaskOrgId).toBe(originalOrgId);
      expect(backgroundTaskUserId).toBe(originalUserId);
      expect(backgroundTaskTraceId).toBe(originalTraceId);
    });

    it('should handle async operations preserving organizationId and userId', async () => {
      const testTraceId = 'test-async-org-user';
      const testOrgId = 2001;
      const testUserId = 2002;
      const capturedValues: Array<{
        orgId: number | undefined;
        userId: number | undefined;
      }> = [];

      await traceContext.run(
        testTraceId,
        async () => {
          capturedValues.push({
            orgId: traceContext.getOrganizationId(),
            userId: traceContext.getUserId(),
          });

          await new Promise((resolve) => setTimeout(resolve, 10));

          capturedValues.push({
            orgId: traceContext.getOrganizationId(),
            userId: traceContext.getUserId(),
          });

          await new Promise((resolve) => setTimeout(resolve, 10));

          capturedValues.push({
            orgId: traceContext.getOrganizationId(),
            userId: traceContext.getUserId(),
          });
        },
        testOrgId,
        testUserId
      );

      // All async operations should maintain the same organization and user IDs
      expect(capturedValues).toHaveLength(3);
      capturedValues.forEach((value) => {
        expect(value.orgId).toBe(testOrgId);
        expect(value.userId).toBe(testUserId);
      });
    });
  });
});

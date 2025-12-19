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
      let contextInfo: any = null;

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
});

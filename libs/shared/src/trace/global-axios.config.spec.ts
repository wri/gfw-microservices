import axios from 'axios';
import { configureGlobalAxiosTracing } from './global-axios.config';
import { traceContext } from './trace.context';

// Mock axios to capture request configs
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  };
});

describe('configureGlobalAxiosTracing', () => {
  let requestInterceptor:
    | ((config: { headers?: Record<string, string> }) => {
        headers: Record<string, string>;
      })
    | null = null;

  beforeEach(() => {
    // Clear any existing interceptors
    (axios.interceptors.request.use as jest.Mock).mockClear();
    requestInterceptor = null;

    // Capture the interceptor function
    (axios.interceptors.request.use as jest.Mock).mockImplementation((fulfilled) => {
      requestInterceptor = fulfilled;
      return 0; // Return interceptor ID
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add trace ID header to axios requests', () => {
    const testTraceId = 'test-trace-id-123';
    jest.spyOn(traceContext, 'getTraceId').mockReturnValue(testTraceId);
    jest.spyOn(traceContext, 'getOrganizationId').mockReturnValue(undefined);
    jest.spyOn(traceContext, 'getUserId').mockReturnValue(undefined);

    configureGlobalAxiosTracing();

    expect(requestInterceptor).not.toBeNull();
    const config = {
      headers: {},
    };

    const result = requestInterceptor!(config);

    expect(result.headers['x-trace-id']).toBe(testTraceId);
  });

  it('should add organization ID header to axios requests', () => {
    const testOrgId = 123;
    jest.spyOn(traceContext, 'getTraceId').mockReturnValue(undefined);
    jest.spyOn(traceContext, 'getOrganizationId').mockReturnValue(testOrgId);
    jest.spyOn(traceContext, 'getUserId').mockReturnValue(undefined);

    configureGlobalAxiosTracing();

    expect(requestInterceptor).not.toBeNull();
    const config = {
      headers: {},
    };

    const result = requestInterceptor!(config);

    expect(result.headers['x-organization-id']).toBe(testOrgId.toString());
  });

  it('should add user ID header to axios requests', () => {
    const testUserId = 456;
    jest.spyOn(traceContext, 'getTraceId').mockReturnValue(undefined);
    jest.spyOn(traceContext, 'getOrganizationId').mockReturnValue(undefined);
    jest.spyOn(traceContext, 'getUserId').mockReturnValue(testUserId);

    configureGlobalAxiosTracing();

    expect(requestInterceptor).not.toBeNull();
    const config = {
      headers: {},
    };

    const result = requestInterceptor!(config);

    expect(result.headers['x-user-id']).toBe(testUserId.toString());
  });

  it('should add all context headers when all values are present', () => {
    const testTraceId = 'test-trace-id-789';
    const testOrgId = 999;
    const testUserId = 888;
    jest.spyOn(traceContext, 'getTraceId').mockReturnValue(testTraceId);
    jest.spyOn(traceContext, 'getOrganizationId').mockReturnValue(testOrgId);
    jest.spyOn(traceContext, 'getUserId').mockReturnValue(testUserId);

    configureGlobalAxiosTracing();

    expect(requestInterceptor).not.toBeNull();
    const config = {
      headers: {},
    };

    const result = requestInterceptor!(config);

    expect(result.headers['x-trace-id']).toBe(testTraceId);
    expect(result.headers['x-organization-id']).toBe(testOrgId.toString());
    expect(result.headers['x-user-id']).toBe(testUserId.toString());
  });

  it('should not add headers when values are undefined', () => {
    jest.spyOn(traceContext, 'getTraceId').mockReturnValue(undefined);
    jest.spyOn(traceContext, 'getOrganizationId').mockReturnValue(undefined);
    jest.spyOn(traceContext, 'getUserId').mockReturnValue(undefined);

    configureGlobalAxiosTracing();

    expect(requestInterceptor).not.toBeNull();
    const config = {
      headers: {},
    };

    const result = requestInterceptor!(config);

    expect(result.headers['x-trace-id']).toBeUndefined();
    expect(result.headers['x-organization-id']).toBeUndefined();
    expect(result.headers['x-user-id']).toBeUndefined();
  });

  it('should handle errors gracefully without breaking requests', () => {
    jest.spyOn(traceContext, 'getTraceId').mockImplementation(() => {
      throw new Error('Context error');
    });
    jest.spyOn(traceContext, 'getOrganizationId').mockReturnValue(undefined);
    jest.spyOn(traceContext, 'getUserId').mockReturnValue(undefined);

    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

    configureGlobalAxiosTracing();

    expect(requestInterceptor).not.toBeNull();
    const config = {
      headers: {},
    };

    const result = requestInterceptor!(config);

    // Request should still succeed
    expect(result).toBeDefined();
    expect(consoleDebugSpy).toHaveBeenCalled();

    consoleDebugSpy.mockRestore();
  });

  it('should preserve existing headers', () => {
    const testTraceId = 'test-trace-id-preserve';
    jest.spyOn(traceContext, 'getTraceId').mockReturnValue(testTraceId);
    jest.spyOn(traceContext, 'getOrganizationId').mockReturnValue(undefined);
    jest.spyOn(traceContext, 'getUserId').mockReturnValue(undefined);

    configureGlobalAxiosTracing();

    expect(requestInterceptor).not.toBeNull();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
      },
    };

    const result = requestInterceptor!(config);

    expect(result.headers['Content-Type']).toBe('application/json');
    expect(result.headers.Authorization).toBe('Bearer token123');
    expect(result.headers['x-trace-id']).toBe(testTraceId);
  });
});

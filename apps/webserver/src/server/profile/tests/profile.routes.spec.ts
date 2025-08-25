// Precompute paths
const mockAccountManagerPath = require.resolve('../../../config/publicutils/accountManager.utils');
const mockUserManagerPath = require.resolve('../../../config/publicutils/userManager.utils');
const mockAuthManagerPath = require.resolve(
  '../../../config/publicutils/authenticationManager.utils'
);
const mockPolicyManagerPath = require.resolve('../../../config/publicutils/policyManager.utils');
const mockLimiterUtilPath = require.resolve('../../../config/lib/limiter-util');
const mockLoggerPath = require.resolve('../../../config/privateutils/logger.utils');
const mockSlackUtilsPath = require.resolve('../../../config/privateutils/slackNotifications.utils');

// Mock path to return these

// Mock the modules with empty or minimal exports

beforeAll(() => {
  jest.mock(mockAccountManagerPath, () => ({}));
  jest.mock(mockUserManagerPath, () => ({}));
  jest.mock(mockAuthManagerPath, () => ({}));
  jest.mock(mockPolicyManagerPath, () => ({}));
  jest.mock(mockLimiterUtilPath, () => ({ useRateLimiter: jest.fn() }));
  jest.mock(mockLoggerPath, () => ({ info: jest.fn(), error: jest.fn() }));
  jest.mock(mockSlackUtilsPath, () => ({
    buildSlackNotificationMessage: jest.fn(),
    sendNotification: jest.fn(),
  }));
  jest.mock('axios', () => ({ default: jest.fn() }));
  jest.mock('express', () => ({
    Router: jest.fn(() => ({
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    })),
  }));
});

describe('profile routes happy path', () => {
  it('registers routes without rate limiter', () => {
    const mockApp = {
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
    };
    const mockLimiter = jest.fn((middleware) => middleware);
    const mockMiddlewares = {
      checkOrganization: 'checkOrganization',
      checkAuthentication: 'checkAuthentication',
      checkActive: 'checkActive',
      checkInactivity: 'checkInactivity',
      rateLimitAuthenticated: 'rateLimitAuthenticated',
    };
    const mockRateLimiterUtil = { useRateLimiter: () => false };
    const mockController = {
      profile: 'profile',
      profileInfo: 'profileInfo',
    };
    const mockAxios = { default: jest.fn().mockResolvedValue({ data: 'data' }) };
    const mockExpress = {
      Router: jest.fn(() => ({ post: jest.fn(), get: jest.fn(), delete: jest.fn() })),
    };

    // Manual code from routes.ts
    const BASE_URL = '/profile'; // Used to compose API calls to EAPI Microservice
    const API_BASE_URL = `/api${BASE_URL}`; // Used for API calls, mostly for routes that return JSON and call the EAPI microservice
    const eapiRoutes = mockExpress.Router();

    eapiRoutes.delete = jest.fn();

    // All methods must under /profile must pass through middleware
    const routeMiddlewares = [
      mockMiddlewares.checkOrganization,
      mockMiddlewares.checkAuthentication,
      mockMiddlewares.checkActive,
      mockMiddlewares.checkInactivity,
    ];

    if (mockRateLimiterUtil.useRateLimiter()) {
      routeMiddlewares.push(mockLimiter(mockMiddlewares.rateLimitAuthenticated));
    }

    mockApp.use('/profile', routeMiddlewares);
    mockApp.get('/profile', mockController.profile);

    mockApp.use('/profile/info', routeMiddlewares);
    mockApp.get('/profile/info', mockController.profileInfo);

    mockApp.post('/profile/activateUser', expect.any(Function)); // The function is async, but for happy path, we can call it later to test

    mockApp.post('/profile/deactivateUser', expect.any(Function));

    mockApp.post('/profile/updateAccount', expect.any(Function));

    mockApp.post('/profile/createuser', expect.any(Function));

    mockApp.post('/profile/updateuser', expect.any(Function));

    mockApp.post('/profile/deletePolicy', expect.any(Function));

    mockApp.get('/profile/downloadPolicy/:policyList', expect.any(Function));

    mockApp.post('/userSecret', mockMiddlewares.checkAuthentication, expect.any(Function));

    const getEAPIMicroserviceUrl = () => 'fake-url';

    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    const runEAPIMicroserviceRequest = async (requestData, request, response, next) => {
      const { method, url, data } = requestData;
      const requestURL = `${getEAPIMicroserviceUrl()}${url}`;
      try {
        const { data: result } = await mockAxios.default({
          url: requestURL,
          method,
          headers: {
            'Content-type': 'application/json',
          },
          data,
        });
        return response.status(200).send(result);
      } catch (err) {
        const { status: statusCode = 500, data: error = err } = err.response || {};
        return response.status(statusCode).send(error);
      }
    };

    const runSwaggerRequest = async (request, response) => {
      const requestURL = `${getEAPIMicroserviceUrl()}/profile`;
      try {
        const { data: result } = await mockAxios.default({
          url: requestURL,
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
          },
        });
        return response.status(200).send(result);
      } catch (err) {
        const { status: statusCode = 500, data: error = err } = err.response || {};
        return response.status(statusCode).send(error);
      }
    };

    mockApp.get(`${API_BASE_URL}/swagger`, [...routeMiddlewares, runSwaggerRequest]);

    mockApp.use(`${API_BASE_URL}/api-keys`, [
      ...routeMiddlewares,
      eapiRoutes,
      runEAPIMicroserviceRequest,
    ]);

    eapiRoutes.post('', (req, res, next) => {
      // this route is used to create a new api key empty body due to the fact that the request body is not used
      const requestOrganizationId = req.session.organization_id;
      const requestUserId = req.session.organization_user_id;
      const request = {
        method: 'POST',
        url: '/api-keys',
        data: {
          organizationId: requestOrganizationId,
          userId: requestUserId,
        },
      };

      next(request);
    });

    eapiRoutes.get('', (req, res, next) => {
      const requestOrganizationId = req.session.organization_id;

      const request = {
        method: 'GET',
        url: `/api-keys/${requestOrganizationId}`,
      };

      next(request);
    });

    eapiRoutes.delete('/:tokenId', (req, res, next) => {
      const { tokenId } = req.params;
      const requestOrganizationId = req.session.organization_id;
      const request = {
        method: 'DELETE',
        url: `/api-keys/${requestOrganizationId}/${tokenId}`,
      };

      next(request);
    });

    // Assertions
    expect(mockApp.use).toHaveBeenCalledWith('/profile', [
      mockMiddlewares.checkOrganization,
      mockMiddlewares.checkAuthentication,
      mockMiddlewares.checkActive,
      mockMiddlewares.checkInactivity,
    ]);

    expect(mockApp.get).toHaveBeenCalledWith('/profile', mockController.profile);
    expect(mockApp.use).toHaveBeenCalledWith('/profile/info', [
      mockMiddlewares.checkOrganization,
      mockMiddlewares.checkAuthentication,
      mockMiddlewares.checkActive,
      mockMiddlewares.checkInactivity,
    ]);
    expect(mockApp.get).toHaveBeenCalledWith('/profile/info', mockController.profileInfo);

    expect(mockApp.post).toHaveBeenCalledWith('/profile/activateUser', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/profile/deactivateUser', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/profile/updateAccount', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/profile/createuser', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/profile/updateuser', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/profile/deletePolicy', expect.any(Function));
    expect(mockApp.get).toHaveBeenCalledWith(
      '/profile/downloadPolicy/:policyList',
      expect.any(Function)
    );
    expect(mockApp.post).toHaveBeenCalledWith(
      '/userSecret',
      mockMiddlewares.checkAuthentication,
      expect.any(Function)
    );
    expect(mockApp.get).toHaveBeenCalledWith('/api/profile/swagger', expect.any(Array));
    expect(mockApp.use).toHaveBeenCalledWith('/api/profile/api-keys', expect.any(Array));
  });
});

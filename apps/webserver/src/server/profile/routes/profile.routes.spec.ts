import * as express from 'express';
import axios from 'axios';
import slackUtils from '../../../config/privateutils/slackNotifications.utils';
import * as UserManager from '../../../config/publicutils/userManager.utils';
import * as AccountManager from '../../../config/publicutils/accountManager.utils';
import * as PolicyManager from '../../../config/publicutils/policyManager.utils';
import rateLimiterUtil from '../../../config/lib/limiter-util';
import * as logger from '../../../config/privateutils/logger.utils';

// Mock all dependencies
jest.mock('express');
jest.mock('axios');
jest.mock('../../../config/privateutils/slackNotifications.utils');
jest.mock('../../../config/publicutils/middlewares');
jest.mock('../../../config/publicutils/userManager.utils');
jest.mock('../../../config/publicutils/accountManager.utils');
jest.mock('../../../config/publicutils/policyManager.utils');
jest.mock('../../../config/lib/limiter-util');
jest.mock('../../../config/privateutils/logger.utils');

describe('Profile Routes', () => {
  let mockApp;
  let mockLimiter;
  let mockEapiRoutes;
  let mockController;
  let mockSlackUtils;
  let mockUserManager;
  let mockAccountManager;
  let mockPolicyManager;
  let mockRateLimiterUtil;
  let mockLogger;
  let mockAxios;
  let profileRoutes;

  // Helper function to setup profile routes
  const setupProfileRoutes = async () => {
    profileRoutes = (await import('./profile.routes')).default;
    profileRoutes(mockApp, mockLimiter);
  };

  // Helper function to find route handler
  const findRouteHandler = (method, path) => {
    const routeCall = mockApp[method].mock.calls.find((call) => call[0] === path);
    return routeCall ? routeCall[1] : null;
  };

  // Helper function to create mock request
  const createMockReq = (overrides = {}) => ({
    body: {},
    session: {
      user_id: '456',
      user_email: 'admin@example.com',
      organization_id: '789',
      user_first_name: 'Admin',
      user_last_name: 'User',
    },
    ...overrides,
  });

  // Helper function to create mock response
  const createMockRes = (overrides = {}) => ({
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    attachment: jest.fn(),
    pipe: jest.fn(),
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create mock Express app
    mockApp = {
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
    };

    // Create mock limiter function
    mockLimiter = jest.fn(() => 'rate-limiter-middleware');

    // Create mock EAPI routes
    mockEapiRoutes = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    // Mock express.Router
    (express.Router as jest.Mock).mockReturnValue(mockEapiRoutes);

    // Mock controller
    mockController = {
      profile: jest.fn(),
      profileInfo: jest.fn(),
    };

    // Mock dependencies
    mockSlackUtils = {
      buildSlackNotificationMessage: jest.fn(),
      sendNotification: jest.fn(),
    };
    mockUserManager = {
      activateUser: jest.fn(),
      deactivateUser: jest.fn(),
      createNewUser: jest.fn(),
      updateUserInfo: jest.fn(),
      getUserSecret: jest.fn(),
    };
    mockAccountManager = {
      updateAccountProfile: jest.fn(),
    };
    mockPolicyManager = {
      uploadPolicies: jest.fn(),
      deletePolicies: jest.fn(),
      downloadPolicy: jest.fn(),
    };
    mockRateLimiterUtil = {
      useRateLimiter: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    mockAxios = axios as jest.Mocked<typeof axios>;

    // Setup module mocks
    jest.mocked(slackUtils).buildSlackNotificationMessage =
      mockSlackUtils.buildSlackNotificationMessage;
    jest.mocked(slackUtils).sendNotification = mockSlackUtils.sendNotification;
    jest.mocked(UserManager).activateUser = mockUserManager.activateUser;
    jest.mocked(UserManager).deactivateUser = mockUserManager.deactivateUser;
    jest.mocked(UserManager).createNewUser = mockUserManager.createNewUser;
    jest.mocked(UserManager).updateUserInfo = mockUserManager.updateUserInfo;
    jest.mocked(UserManager).getUserSecret = mockUserManager.getUserSecret;
    jest.mocked(AccountManager).updateAccountProfile = mockAccountManager.updateAccountProfile;
    jest.mocked(PolicyManager).uploadPolicies = mockPolicyManager.uploadPolicies;
    jest.mocked(PolicyManager).deletePolicies = mockPolicyManager.deletePolicies;
    jest.mocked(PolicyManager).downloadPolicy = mockPolicyManager.downloadPolicy;
    jest.mocked(rateLimiterUtil).useRateLimiter = mockRateLimiterUtil.useRateLimiter;
    jest.mocked(logger).info = mockLogger.info;
    jest.mocked(logger).error = mockLogger.error;

    // Mock process.env
    process.env.EAPI_MICROSERVICE_URL = 'http://test-eapi.com/api';

    // Setup profile routes once for all tests
    await setupProfileRoutes();
  });

  afterEach(() => {
    delete process.env.EAPI_MICROSERVICE_URL;
  });

  describe('Route setup', () => {
    it('should set up profile routes with middleware', () => {
      expect(mockApp.use).toHaveBeenCalledWith('/profile', expect.any(Array));
      expect(mockApp.get).toHaveBeenCalledWith('/profile', mockController.profile);
      expect(mockApp.use).toHaveBeenCalledWith('/profile/info', expect.any(Array));
      expect(mockApp.get).toHaveBeenCalledWith('/profile/info', mockController.profileInfo);
    });

    it('should include rate limiter when enabled', () => {
      mockRateLimiterUtil.useRateLimiter.mockReturnValue(true);
      expect(mockApp.use).toHaveBeenCalledWith(
        '/profile',
        expect.arrayContaining(['rate-limiter-middleware'])
      );
    });

    it('should not include rate limiter when disabled', () => {
      mockRateLimiterUtil.useRateLimiter.mockReturnValue(false);
      expect(mockApp.use).toHaveBeenCalledWith(
        '/profile',
        expect.not.arrayContaining(['rate-limiter-middleware'])
      );
    });
  });

  describe('activateUser route', () => {
    it('should activate user successfully', async () => {
      const mockReq = createMockReq({
        body: { id: '123', email: 'test@example.com', first_name: 'John', last_name: 'Doe' },
      });
      const mockRes = createMockRes();

      mockUserManager.activateUser.mockResolvedValue(undefined);

      const activateUserHandler = findRouteHandler('post', '/profile/activateUser');
      await activateUserHandler(mockReq, mockRes);

      expect(mockLogger.info).toHaveBeenCalledWith('POST /profile/activateUser');
      expect(mockUserManager.activateUser).toHaveBeenCalledWith(
        mockReq,
        '123',
        'test@example.com',
        'John',
        'Doe'
      );
      expect(mockRes.send).toHaveBeenCalledWith({ redirect: '/profile' });
    });

    it('should handle activation error and send slack notification', async () => {
      const mockReq = createMockReq({
        body: { id: '123', email: 'test@example.com', first_name: 'John', last_name: 'Doe' },
      });
      const mockRes = createMockRes();
      const mockError = new Error('Activation failed');

      mockUserManager.activateUser.mockRejectedValue(mockError);
      mockSlackUtils.buildSlackNotificationMessage.mockReturnValue('slack-message');
      mockSlackUtils.sendNotification.mockResolvedValue(undefined);

      const activateUserHandler = findRouteHandler('post', '/profile/activateUser');
      await activateUserHandler(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith('POST /profile/activateUser', mockError);
      expect(mockSlackUtils.buildSlackNotificationMessage).toHaveBeenCalledWith({
        url: 'POST /profile/activateUser',
        stackTrace: JSON.stringify(mockError),
        userInfo: {
          id: '456',
          email: 'admin@example.com',
          OrgID: '789',
          first_name: 'Admin',
          last_name: 'User',
        },
        browserInfo: '',
      });
      expect(mockSlackUtils.sendNotification).toHaveBeenCalledWith('slack-message');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deactivateUser route', () => {
    it('should deactivate user successfully', async () => {
      const mockReq = createMockReq({
        body: { name: 'testuser' },
      });
      const mockRes = createMockRes();

      mockUserManager.deactivateUser.mockResolvedValue(undefined);

      const deactivateUserHandler = findRouteHandler('post', '/profile/deactivateUser');
      await deactivateUserHandler(mockReq, mockRes);

      expect(mockLogger.info).toHaveBeenCalledWith('POST /profile/deactivateUser');
      expect(mockUserManager.deactivateUser).toHaveBeenCalledWith(mockReq, 'testuser');
      expect(mockRes.send).toHaveBeenCalledWith({ redirect: '/profile' });
    });

    it('should handle deactivation error and send slack notification', async () => {
      const mockReq = createMockReq({
        body: { name: 'testuser' },
      });
      const mockRes = createMockRes();
      const mockError = new Error('Deactivation failed');

      mockUserManager.deactivateUser.mockRejectedValue(mockError);
      mockSlackUtils.buildSlackNotificationMessage.mockReturnValue('slack-message');
      mockSlackUtils.sendNotification.mockResolvedValue(undefined);

      const deactivateUserHandler = findRouteHandler('post', '/profile/deactivateUser');
      await deactivateUserHandler(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith('POST /profile/deactivateUser', mockError);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateAccount route', () => {
    const createUpdateAccountReq = (overrides = {}) =>
      createMockReq({
        body: {
          org_name: 'Test Org',
          org_address: '123 Test St',
          org_website: 'test.com',
          parent_org_name: 'Parent Org',
          is_subsidiary: true,
          arr_org_classification_ids: [1, 2],
          policyUploadList: [],
          policyNames: [],
          overwrite: false,
          ...overrides,
        },
      });

    it('should update account profile successfully without policies', async () => {
      const mockReq = createUpdateAccountReq();
      const mockRes = createMockRes();

      mockAccountManager.updateAccountProfile.mockResolvedValue('success');

      const updateAccountHandler = findRouteHandler('post', '/profile/updateAccount');
      await updateAccountHandler(mockReq, mockRes);

      expect(mockLogger.info).toHaveBeenCalledWith('POST /profile/updateAccount');
      expect(mockAccountManager.updateAccountProfile).toHaveBeenCalledWith(
        mockReq,
        'Test Org',
        '123 Test St',
        'test.com',
        'Parent Org',
        true,
        [1, 2]
      );
      expect(mockRes.send).toHaveBeenCalledWith({ redirect: '/profile', policyResult: [] });
    });

    it('should update account profile with policies', async () => {
      const mockReq = createUpdateAccountReq({
        policyUploadList: ['policy1.pdf'],
        policyNames: ['Policy 1'],
        overwrite: true,
      });
      const mockRes = createMockRes();

      mockAccountManager.updateAccountProfile.mockResolvedValue('success');
      mockPolicyManager.uploadPolicies.mockResolvedValue(['policy1']);

      const updateAccountHandler = findRouteHandler('post', '/profile/updateAccount');
      await updateAccountHandler(mockReq, mockRes);

      expect(mockPolicyManager.uploadPolicies).toHaveBeenCalledWith(
        mockReq,
        ['policy1.pdf'],
        ['Policy 1'],
        true
      );
      expect(mockRes.send).toHaveBeenCalledWith({
        redirect: '/profile',
        policyResult: ['policy1'],
      });
    });

    it('should handle update account error', async () => {
      const mockReq = createUpdateAccountReq();
      const mockRes = createMockRes();
      const mockError = new Error('Update failed');

      mockAccountManager.updateAccountProfile.mockRejectedValue(mockError);

      const updateAccountHandler = findRouteHandler('post', '/profile/updateAccount');
      await updateAccountHandler(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'POST /profile/updateAccount [updateAccountProfile]',
        mockError
      );
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createuser route', () => {
    const createUserReq = (overrides = {}) =>
      createMockReq({
        body: {
          first_name: 'John',
          middle_initial: 'D',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          title_id: 1,
          other_title: '',
          access_level_id: 2,
          enableAlerts: true,
          geographies: [1, 2],
          commodities: [3, 4],
          ...overrides,
        },
      });

    it('should create user successfully', async () => {
      const mockReq = createUserReq();
      const mockRes = createMockRes();

      mockUserManager.createNewUser.mockResolvedValue('new-user-id');

      const createUserHandler = findRouteHandler('post', '/profile/createuser');
      await createUserHandler(mockReq, mockRes);

      expect(mockLogger.info).toHaveBeenCalledWith('POST /profile/createuser');
      expect(mockUserManager.createNewUser).toHaveBeenCalledWith(
        mockReq,
        'John',
        'D',
        'Doe',
        'john@example.com',
        '123-456-7890',
        1,
        '',
        2,
        true,
        [1, 2],
        [3, 4]
      );
      expect(mockRes.send).toHaveBeenCalledWith({
        redirect: '/profile',
        user_id: 'new-user-id',
      });
    });

    it('should handle create user error', async () => {
      const mockReq = createUserReq();
      const mockRes = createMockRes();
      const mockError = new Error('Creation failed');

      mockUserManager.createNewUser.mockRejectedValue(mockError);

      const createUserHandler = findRouteHandler('post', '/profile/createuser');
      await createUserHandler(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith('POST /profile/createuser', mockError);
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe('updateuser route', () => {
    const createUpdateUserReq = (overrides = {}) =>
      createMockReq({
        body: {
          id: '123',
          first_name: 'John',
          middle_initial: 'D',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          title_id: 1,
          other_title: '',
          access_level_id: 2,
          enableAlerts: true,
          geographies: [1, 2],
          commodities: [3, 4],
          auth_preference_id: 1,
          ...overrides,
        },
        session: { user_access_level_id: 2 },
      });

    it('should update user successfully', async () => {
      const mockReq = createUpdateUserReq();
      const mockRes = createMockRes();

      mockUserManager.updateUserInfo.mockResolvedValue('updated');

      const updateUserHandler = findRouteHandler('post', '/profile/updateuser');
      await updateUserHandler(mockReq, mockRes);

      expect(mockLogger.info).toHaveBeenCalledWith('POST /profile/updateuser');
      expect(mockUserManager.updateUserInfo).toHaveBeenCalledWith({
        req: mockReq,
        user_id: '123',
        user_first_name: 'John',
        user_middle_initial: 'D',
        user_last_name: 'Doe',
        user_email: 'john@example.com',
        user_phone: '123-456-7890',
        user_title_id: 1,
        other_title: '',
        access_level_id: 2,
        email_subscription: true,
        arr_user_geography_ids: [1, 2],
        arr_user_commodity_ids: [3, 4],
        user_auth_preference_id: 1,
        loggedUserAccessLevelId: 2,
      });
      expect(mockRes.send).toHaveBeenCalledWith('updated');
    });

    it('should handle update user error', async () => {
      const mockReq = createUpdateUserReq();
      const mockRes = createMockRes();
      const mockError = new Error('Update failed');

      mockUserManager.updateUserInfo.mockRejectedValue(mockError);

      const updateUserHandler = findRouteHandler('post', '/profile/updateuser');
      await updateUserHandler(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith('POST /profile/updateuser', mockError);
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deletePolicy route', () => {
    const createDeletePolicyReq = (overrides = {}) =>
      createMockReq({
        body: { policySelectedList: ['policy1', 'policy2'], ...overrides },
      });

    it('should delete policies successfully', async () => {
      const mockReq = createDeletePolicyReq();
      const mockRes = createMockRes();

      mockPolicyManager.deletePolicies.mockResolvedValue(true);

      const deletePolicyHandler = findRouteHandler('post', '/profile/deletePolicy');
      await deletePolicyHandler(mockReq, mockRes);

      expect(mockLogger.info).toHaveBeenCalledWith('POST /profile/deletePolicy');
      expect(mockPolicyManager.deletePolicies).toHaveBeenCalledWith(mockReq, [
        'policy1',
        'policy2',
      ]);
      expect(mockRes.send).toHaveBeenCalledWith('Success');
    });

    it('should handle delete policy failure', async () => {
      const mockReq = createDeletePolicyReq();
      const mockRes = createMockRes();

      mockPolicyManager.deletePolicies.mockResolvedValue(false);

      const deletePolicyHandler = findRouteHandler('post', '/profile/deletePolicy');
      await deletePolicyHandler(mockReq, mockRes);

      expect(mockRes.send).toHaveBeenCalledWith('Failed');
    });

    it('should handle delete policy error', async () => {
      const mockReq = createDeletePolicyReq();
      const mockRes = createMockRes();
      const mockError = new Error('Delete failed');

      mockPolicyManager.deletePolicies.mockRejectedValue(mockError);

      const deletePolicyHandler = findRouteHandler('post', '/profile/deletePolicy');
      await deletePolicyHandler(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith('POST /profile/deletePolicy', mockError);
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe('downloadPolicy route', () => {
    const createDownloadPolicyReq = (overrides = {}) =>
      createMockReq({
        params: { policyList: 'policy1.pdf' },
        session: { organization_id: 'org123' },
        ...overrides,
      });

    it('should download policy successfully', async () => {
      const mockReq = createDownloadPolicyReq();
      const mockRes = createMockRes();
      const mockFileStream = { pipe: jest.fn() };

      mockPolicyManager.downloadPolicy.mockResolvedValue(mockFileStream);

      const downloadPolicyHandler = findRouteHandler('get', '/profile/downloadPolicy/:policyList');
      await downloadPolicyHandler(mockReq, mockRes);

      expect(mockLogger.info).toHaveBeenCalledWith('GET /profile/downloadPolicy/:policyList');
      expect(mockPolicyManager.downloadPolicy).toHaveBeenCalledWith(
        mockReq,
        'policy1.pdf',
        'org123'
      );
      expect(mockRes.attachment).toHaveBeenCalledWith('policy1.pdf');
      expect(mockFileStream.pipe).toHaveBeenCalledWith(mockRes);
    });

    it('should handle download policy error', async () => {
      const mockReq = createDownloadPolicyReq();
      const mockRes = createMockRes();
      const mockError = new Error('Download failed');

      mockPolicyManager.downloadPolicy.mockRejectedValue(mockError);

      const downloadPolicyHandler = findRouteHandler('get', '/profile/downloadPolicy/:policyList');
      await downloadPolicyHandler(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'GET /profile/downloadPolicy/:policyList',
        mockError
      );
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe('userSecret route', () => {
    const createUserSecretReq = (overrides = {}) =>
      createMockReq({
        body: { email: 'user@example.com', ...overrides },
      });

    it('should get user secret successfully', async () => {
      const mockReq = createUserSecretReq();
      const mockRes = createMockRes();

      mockUserManager.getUserSecret.mockResolvedValue('secret123');

      const userSecretHandler = findRouteHandler('post', '/userSecret');
      await userSecretHandler(mockReq, mockRes);

      expect(mockUserManager.getUserSecret).toHaveBeenCalledWith(mockReq, 'user@example.com');
      expect(mockRes.send).toHaveBeenCalledWith('secret123');
    });

    it('should handle user secret error', async () => {
      const mockReq = createUserSecretReq();
      const mockRes = createMockRes();
      const mockError = new Error('Secret not found');

      mockUserManager.getUserSecret.mockRejectedValue(mockError);

      const userSecretHandler = findRouteHandler('post', '/userSecret');
      await userSecretHandler(mockReq, mockRes);

      expect(mockLogger.error).toHaveBeenCalledWith('POST /userSecret', mockError);
    });
  });

  describe('EAPI Microservice routes', () => {
    it('should set up swagger route', () => {
      const swaggerCall = mockApp.get.mock.calls.find((call) => call[0] === '/api/profile/swagger');
      expect(swaggerCall).toBeDefined();
    });

    it('should set up api-keys routes', () => {
      const apiKeysCall = mockApp.use.mock.calls.find(
        (call) => call[0] === '/api/profile/api-keys'
      );
      expect(apiKeysCall).toBeDefined();
    });

    it('should handle EAPI microservice request successfully', async () => {
      const mockReq = {};
      const mockRes = createMockRes();
      const mockNext = jest.fn();

      mockAxios.mockResolvedValue({ data: 'success' });

      // Get the runEAPIMicroserviceRequest function from the closure
      const apiKeysCall = mockApp.use.mock.calls.find(
        (call) => call[0] === '/api/profile/api-keys'
      );
      const middlewareStack = apiKeysCall[1];
      const eapiMiddleware = middlewareStack[middlewareStack.length - 1];

      const requestData = {
        method: 'GET',
        url: '/test',
        data: null,
      };

      await eapiMiddleware(requestData, mockReq, mockRes, mockNext);

      expect(mockAxios).toHaveBeenCalledWith({
        url: 'http://test-eapi.com/api/test',
        method: 'GET',
        headers: { 'Content-type': 'application/json' },
        data: null,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith('success');
    });

    it('should handle EAPI microservice request error', async () => {
      const mockReq = {};
      const mockRes = createMockRes();
      const mockNext = jest.fn();

      const mockError = {
        response: {
          status: 404,
          data: 'Not found',
        },
      };
      mockAxios.mockRejectedValue(mockError);

      const apiKeysCall = mockApp.use.mock.calls.find(
        (call) => call[0] === '/api/profile/api-keys'
      );
      const middlewareStack = apiKeysCall[1];
      const eapiMiddleware = middlewareStack[middlewareStack.length - 1];

      const requestData = {
        method: 'GET',
        url: '/test',
        data: null,
      };

      await eapiMiddleware(requestData, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('Not found');
    });

    it('should handle EAPI microservice request error without response', async () => {
      const mockReq = {};
      const mockRes = createMockRes();
      const mockNext = jest.fn();

      const mockError = new Error('Network error');
      mockAxios.mockRejectedValue(mockError);

      const apiKeysCall = mockApp.use.mock.calls.find(
        (call) => call[0] === '/api/profile/api-keys'
      );
      const middlewareStack = apiKeysCall[1];
      const eapiMiddleware = middlewareStack[middlewareStack.length - 1];

      const requestData = {
        method: 'GET',
        url: '/test',
        data: null,
      };

      await eapiMiddleware(requestData, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Swagger request', () => {
    it('should handle swagger request successfully', async () => {
      const mockReq = {};
      const mockRes = createMockRes();

      mockAxios.mockResolvedValue({ data: 'swagger-data' });

      const swaggerCall = mockApp.get.mock.calls.find((call) => call[0] === '/api/profile/swagger');
      const middlewareStack = swaggerCall[1];
      const swaggerMiddleware = middlewareStack[middlewareStack.length - 1];

      await swaggerMiddleware(mockReq, mockRes);

      expect(mockAxios).toHaveBeenCalledWith({
        url: 'http://test-eapi.com/api/profile',
        method: 'GET',
        headers: { 'Content-type': 'application/json' },
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith('swagger-data');
    });

    it('should handle swagger request error', async () => {
      const mockReq = {};
      const mockRes = createMockRes();

      const mockError = {
        response: {
          status: 500,
          data: 'Internal error',
        },
      };
      mockAxios.mockRejectedValue(mockError);

      const swaggerCall = mockApp.get.mock.calls.find((call) => call[0] === '/api/profile/swagger');
      const middlewareStack = swaggerCall[1];
      const swaggerMiddleware = middlewareStack[middlewareStack.length - 1];

      await swaggerMiddleware(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('EAPI sub-routes', () => {
    it('should handle POST api-keys route', () => {
      const mockReq = createMockReq({
        session: {
          organization_id: 'org123',
          organization_user_id: 'user456',
        },
      });
      const mockRes = {};
      const mockNext = jest.fn();

      const postCall = mockEapiRoutes.post.mock.calls.find((call) => call[0] === '');
      const postHandler = postCall[1];

      postHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api-keys',
        data: {
          organizationId: 'org123',
          userId: 'user456',
        },
      });
    });

    it('should handle GET api-keys route', () => {
      const mockReq = createMockReq({
        session: { organization_id: 'org123' },
      });
      const mockRes = {};
      const mockNext = jest.fn();

      const getCall = mockEapiRoutes.get.mock.calls.find((call) => call[0] === '');
      const getHandler = getCall[1];

      getHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api-keys/org123',
      });
    });

    it('should handle DELETE api-keys route', () => {
      const mockReq = createMockReq({
        params: { tokenId: 'token123' },
        session: { organization_id: 'org123' },
      });
      const mockRes = {};
      const mockNext = jest.fn();

      const deleteCall = mockEapiRoutes.delete.mock.calls.find((call) => call[0] === '/:tokenId');
      const deleteHandler = deleteCall[1];

      deleteHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/api-keys/org123/token123',
      });
    });
  });
});

/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Get real paths that the controller will resolve to (prefix with mock* so Jest allows access)
const mockAccountManagerPath = require.resolve('../../../config/publicutils/accountManager.utils');
const mockProManagerPath = require.resolve('../../../config/publicutils/proManager.utils');
const mockUserManagerPath = require.resolve('../../../config/publicutils/userManager.utils');
const mockPolicyManagerPath = require.resolve('../../../config/publicutils/policyManager.utils');
const mockLoggerPath = require.resolve('../../../config/privateutils/logger.utils');
const mockOrgAccountStatusPath = require.resolve('../../../config/env/orgAccountStatus.constants');
const mockErrorUtilsPath = require.resolve('../../../config/privateutils/error.utils');
const mockSpeakeasyPath = require.resolve('../../../config/privateutils/speakeasy.utils');
const mockSqlUtilsPath = require.resolve('../../../config/privateutils/sql.utils');

// Get paths for modules that use path.resolve(__dirname, ...)
const mockLangResourcesPath = require.resolve('../../../config/langResources');
const mockListStatusesPath = require.resolve('../../../config/env/listStatuses.constants');
const mockSesUtilsPath = require.resolve('../../../config/privateutils/ses.utils');
const mockCognitoUtilsPath = require.resolve('../../../config/privateutils/cognito.utils');
const mockAuthenticationManagerPath = require.resolve(
  '../../../config/publicutils/authenticationManager.utils'
);

// Mock path.resolve to return our known paths
jest.mock('path', () => {
  const actualPath = jest.requireActual('path');
  return {
    ...actualPath,
    resolve: jest.fn((...args: string[]) => {
      const firstArg = args[0];
      const lastArg = args[args.length - 1];
      const joined = args.join('/');

      // Handle path.resolve(__dirname, '../langResources') pattern
      if (joined.includes('langResources') || lastArg === '../langResources') {
        return mockLangResourcesPath;
      }
      // Handle path.resolve(__dirname, '../env/listStatuses.constants') pattern
      if (
        joined.includes('listStatuses.constants') ||
        lastArg?.includes('listStatuses.constants')
      ) {
        return mockListStatusesPath;
      }
      // Handle path.resolve('./config/...') patterns from various files
      if (
        firstArg === './config/publicutils/accountManager.utils' ||
        lastArg?.includes('accountManager.utils')
      ) {
        return mockAccountManagerPath;
      }
      if (
        firstArg === './config/publicutils/proManager.utils' ||
        lastArg?.includes('proManager.utils')
      ) {
        return mockProManagerPath;
      }
      if (
        firstArg === './config/publicutils/userManager.utils' ||
        lastArg?.includes('userManager.utils')
      ) {
        return mockUserManagerPath;
      }
      if (
        firstArg === './config/publicutils/policyManager.utils' ||
        lastArg?.includes('policyManager.utils')
      ) {
        return mockPolicyManagerPath;
      }
      if (
        firstArg === './config/publicutils/authenticationManager.utils' ||
        lastArg?.includes('authenticationManager.utils')
      ) {
        return mockAuthenticationManagerPath;
      }
      if (firstArg === './config/privateutils/logger.utils' || lastArg?.includes('logger.utils')) {
        return mockLoggerPath;
      }
      if (firstArg === './config/privateutils/error.utils' || lastArg?.includes('error.utils')) {
        return mockErrorUtilsPath;
      }
      if (
        firstArg === './config/privateutils/speakeasy.utils' ||
        lastArg?.includes('speakeasy.utils')
      ) {
        return mockSpeakeasyPath;
      }
      if (firstArg === './config/privateutils/sql.utils' || lastArg?.includes('sql.utils')) {
        return mockSqlUtilsPath;
      }
      if (firstArg === './config/privateutils/ses.utils' || lastArg?.includes('ses.utils')) {
        return mockSesUtilsPath;
      }
      if (
        firstArg === './config/privateutils/cognito.utils' ||
        lastArg?.includes('cognito.utils')
      ) {
        return mockCognitoUtilsPath;
      }
      if (
        firstArg === './config/env/orgAccountStatus.constants' ||
        lastArg?.includes('orgAccountStatus.constants')
      ) {
        return mockOrgAccountStatusPath;
      }
      // Fallback to actual path.resolve
      return actualPath.resolve(...args);
    }),
  };
});

// Mock the actual modules at their resolved paths (use literal require.resolve to avoid hoist issues)
jest.mock(require.resolve('../../../config/publicutils/accountManager.utils'), () => ({
  getClassifications: jest.fn(() => ['A']),
  updatePendingAccount: jest.fn(),
}));

jest.mock(require.resolve('../../../config/publicutils/proManager.utils'), () => ({
  getAllAccountsList: jest.fn(),
  getAllUsersList: jest.fn(),
  activatePendingAccount: jest.fn(),
  reactivateAccount: jest.fn(),
  deactivateAccount: jest.fn(),
  closePendingAccount: jest.fn(),
  updateAccountSubscriptionStatus: jest.fn(),
}));

jest.mock(require.resolve('../../../config/publicutils/userManager.utils'), () => ({
  getStatuses: jest.fn(() => ['active']),
  getAccessLevels: jest.fn(() => ['admin']),
  getCommodities: jest.fn(() => ['soy']),
  getGeographies: jest.fn(() => ['br']),
  getTitles: jest.fn(() => ['mgr']),
}));

jest.mock(require.resolve('../../../config/publicutils/policyManager.utils'), () => ({
  getPendingPolicyList: jest.fn(),
  getAllPolicyList: jest.fn(),
  uploadPendingPolicies: jest.fn(),
}));

jest.mock(require.resolve('../../../config/privateutils/logger.utils'), () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock(require.resolve('../../../config/env/orgAccountStatus.constants'), () => ({
  orgAccountStatus: { Pending: 0 },
}));

// Mock additional modules that are required via path.resolve
jest.mock(require.resolve('../../../config/privateutils/error.utils'), () => ({
  ERROR_CODES: {
    failedToActivateAccount: 'failedToActivateAccount',
    userNotProManager: 'userNotProManager',
    invalidStatusTransition: 'invalidStatusTransition',
  },
}));

jest.mock(require.resolve('../../../config/privateutils/ses.utils'), () => ({
  sendEmail: jest.fn(),
  sendBulkEmail: jest.fn(),
}));

jest.mock(require.resolve('../../../config/privateutils/cognito.utils'), () => ({
  authenticateUser: jest.fn(),
  createUser: jest.fn(),
  updateUserAttributes: jest.fn(),
}));

jest.mock(require.resolve('../../../config/publicutils/authenticationManager.utils'), () => ({
  authenticate: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.mock(require.resolve('../../../config/privateutils/speakeasy.utils'), () => ({
  generateSecret: jest.fn(),
  totp: jest.fn(),
}));

jest.mock(require.resolve('../../../config/privateutils/sql.utils'), () => ({
  executeSystemStoredProcedure: jest.fn(),
  executeOrganizationStoredProcedure: jest.fn(),
}));

// Mock other dependencies
jest.mock('../../../config/config', () => ({
  __esModule: true,
  default: {
    SQLConnection: {
      host: 'localhost',
      port: '1433',
      database: 'testdb',
      username: 'sa',
      password: 'password',
    },
    platformVars: {
      authenticationStatus: {},
    },
    AWSVars: {
      cognito: {
        region: 'us-east-1',
        userpoolId: 'test-pool-id',
        clientId: 'test-client-id',
      },
    },
    compiledAssets: {
      js: { common: 'common.js', proManagerList: 'proList.js' },
      css: { proManagerList: 'proList.css' },
    },
  },
}));

jest.mock(
  '@wri-monorepos/shared',
  () => ({
    getLatestLimits: jest.fn((limits) => limits[0] || {}),
    getAccountSubscriptionLimits: jest.fn(),
    getAccountExtraLimits: jest.fn(),
    getAccountRolloverLimits: jest.fn(),
    combineOrganizationLimits: jest.fn(),
  }),
  { virtual: true }
);

jest.mock(
  '@wri-monorepos/constants',
  () => ({
    analysisTypesOptionsNewNames: {},
  }),
  { virtual: true }
);

jest.mock(
  '@wri-monorepos/sql',
  () => ({
    getAccountRenewalTime: jest.fn(),
  }),
  { virtual: true }
);

// Mock langResources and listStatuses.constants that are required via path.resolve
jest.mock('../../../config/langResources', () => ({
  en: {
    userIsNotAnAdmin: 'User is not an Administrator.',
  },
}));

jest.mock('../../../config/env/listStatuses.constants', () => ({
  listStatusDescriptions: {},
  listStatus: {},
}));

jest.mock('../../../config/env/userStatuses.constants', () => ({
  USER_STATUS: {},
}));

jest.mock('../../downloader', () => ({
  sendMessageToQueue: jest.fn(() => 'queue-message'),
}));

jest.mock('../../vectorTiles/utils/vectorTile.utils', () => ({
  getCurrentDateTimeFormatted: jest.fn(() => '20260102_120000'),
}));

// Now import the controller (mocks are in place)
import {
  proManagerList,
  proManagerListAccountsData,
  proManagerListAccountDetailData,
  proManagerListUsersData,
  proManagerListUsersExport,
  proManagerListUserDetailData,
  activatePendingAccount,
  reactivateAccount,
  deactivateAccount,
  closePendingAccount,
  updateProAccount,
} from './proManagerList.controller';

// Get references to mocked modules
const AccountManager = require(mockAccountManagerPath);
const ProManager = require(mockProManagerPath);
const UserManager = require(mockUserManagerPath);
const PolicyManager = require(mockPolicyManagerPath);
const { ERROR_CODES } = require('../../../config/privateutils/error.utils');
const {
  getAccountSubscriptionLimits,
  getAccountExtraLimits,
  getAccountRolloverLimits,
  combineOrganizationLimits,
} = require('@wri-monorepos/shared');
const { getAccountRenewalTime } = require('@wri-monorepos/sql');
const { sendMessageToQueue } = require('../../downloader');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.render = jest.fn().mockReturnValue(res);
  return res;
};

// Helper to wait for promises to resolve (for functions that don't return promises)
const waitForPromises = () => new Promise((resolve) => process.nextTick(resolve));

describe('proManagerList.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset all mocks to default values
    (AccountManager.getClassifications as jest.Mock).mockReturnValue(['A']);
    (UserManager.getStatuses as jest.Mock).mockReturnValue(['active']);
    (UserManager.getAccessLevels as jest.Mock).mockReturnValue(['admin']);
    (UserManager.getCommodities as jest.Mock).mockReturnValue(['soy']);
    (UserManager.getGeographies as jest.Mock).mockReturnValue(['br']);
    (UserManager.getTitles as jest.Mock).mockReturnValue(['mgr']);

    (ProManager.getAllAccountsList as jest.Mock).mockResolvedValue([]);
    (ProManager.getAllUsersList as jest.Mock).mockResolvedValue([]);
    (ProManager.activatePendingAccount as jest.Mock).mockResolvedValue(undefined);
    (ProManager.reactivateAccount as jest.Mock).mockResolvedValue(undefined);
    (ProManager.deactivateAccount as jest.Mock).mockResolvedValue(undefined);
    (ProManager.closePendingAccount as jest.Mock).mockResolvedValue(undefined);
    (ProManager.updateAccountSubscriptionStatus as jest.Mock).mockResolvedValue(undefined);

    (PolicyManager.getPendingPolicyList as jest.Mock).mockResolvedValue([]);
    (PolicyManager.getAllPolicyList as jest.Mock).mockResolvedValue([]);
    (PolicyManager.uploadPendingPolicies as jest.Mock).mockResolvedValue(undefined);

    (getAccountSubscriptionLimits as jest.Mock).mockResolvedValue([{ sub: true }]);
    (getAccountExtraLimits as jest.Mock).mockResolvedValue({ extra: true });
    (getAccountRolloverLimits as jest.Mock).mockResolvedValue({ roll: true });
    (combineOrganizationLimits as jest.Mock).mockReturnValue({ combined: true });
    (getAccountRenewalTime as jest.Mock).mockResolvedValue('2025-01-01');
  });

  describe('proManagerList', () => {
    it('renders proManagerList with compiled assets', () => {
      const res = mockRes();
      proManagerList({} as any, res);
      expect(res.render).toHaveBeenCalledWith('proManagerList', {
        common: 'common.js',
        proManagerListjs: 'proList.js',
        proManagerListcss: 'proList.css',
      });
    });
  });

  describe('proManagerListAccountsData', () => {
    it('returns accounts data with classes and statusData', async () => {
      const res = mockRes();
      const mockAccounts = [{ id: 1, organization_id: 5 }];
      (ProManager.getAllAccountsList as jest.Mock).mockResolvedValue(mockAccounts);

      proManagerListAccountsData({} as any, res);

      // Wait for Promise.all to resolve
      await waitForPromises();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        accounts: mockAccounts,
        classes: ['A'],
        statusData: ['active'],
      });
    });

    it('handles errors and returns 500', async () => {
      const res = mockRes();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (ProManager.getAllAccountsList as jest.Mock).mockRejectedValue(new Error('DB error'));

      proManagerListAccountsData({} as any, res);

      // Wait for Promise.all to reject
      await waitForPromises();

      expect(res.status).toHaveBeenCalledWith(500);
      consoleSpy.mockRestore();
    });
  });

  describe('proManagerListAccountDetailData', () => {
    it('enriches account with limits when not pending', async () => {
      const res = mockRes();
      const mockAccount = {
        organization_id: 7,
        organization_status_id: 1,
        subscription_status_id: 3,
      };
      (ProManager.getAllAccountsList as jest.Mock).mockResolvedValue([mockAccount]);
      (ProManager.getAllUsersList as jest.Mock).mockResolvedValue([]);

      await proManagerListAccountDetailData({ params: { organizationId: '7' } } as any, res);

      expect(getAccountRenewalTime).toHaveBeenCalledWith(7);
      expect(getAccountSubscriptionLimits).toHaveBeenCalledWith(3, '2025-01-01');
      expect(getAccountExtraLimits).toHaveBeenCalledWith(7);
      expect(combineOrganizationLimits).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].selectedAccount.analysis_limits).toEqual({
        limits: { combined: true },
        subscriptionLimits: { sub: true },
        extraLimits: { roll: true },
      });
    });

    it('sets analysis_limits to null when account is pending', async () => {
      const res = mockRes();
      const mockAccount = {
        organization_id: 9,
        organization_status_id: 0,
        subscription_status_id: 2,
      };
      (ProManager.getAllAccountsList as jest.Mock).mockResolvedValue([mockAccount]);
      (ProManager.getAllUsersList as jest.Mock).mockResolvedValue([]);

      await proManagerListAccountDetailData({ params: { organizationId: '9' } } as any, res);

      expect(res.json.mock.calls[0][0].selectedAccount.analysis_limits).toBeNull();
    });

    it('returns 500 on error', async () => {
      const res = mockRes();
      (ProManager.getAllAccountsList as jest.Mock).mockRejectedValue(new Error('boom'));

      await proManagerListAccountDetailData({ params: { organizationId: '1' } } as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('returns null selectedAccount when organization not found', async () => {
      const res = mockRes();
      (ProManager.getAllAccountsList as jest.Mock).mockResolvedValue([]);
      (ProManager.getAllUsersList as jest.Mock).mockResolvedValue([]);

      await proManagerListAccountDetailData({ params: { organizationId: '999' } } as any, res);

      expect(res.json.mock.calls[0][0].selectedAccount).toBeNull();
    });
  });

  describe('proManagerListUsersData', () => {
    it('returns users data with accessData and statusData', async () => {
      const res = mockRes();
      const mockUsers = [{ user_id: 2, name: 'Test User' }];
      (ProManager.getAllUsersList as jest.Mock).mockResolvedValue(mockUsers);

      proManagerListUsersData({} as any, res);

      // Wait for Promise.all to resolve
      await waitForPromises();

      expect(res.json).toHaveBeenCalledWith({
        users: mockUsers,
        statusData: ['active'],
        accessData: ['admin'],
      });
    });

    it('handles errors and returns 500', async () => {
      const res = mockRes();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (ProManager.getAllUsersList as jest.Mock).mockRejectedValue(new Error('DB error'));

      proManagerListUsersData({} as any, res);

      // Wait for Promise.all to reject
      await waitForPromises();

      expect(res.status).toHaveBeenCalledWith(500);
      consoleSpy.mockRestore();
    });
  });

  describe('proManagerListUsersExport', () => {
    it('queues a Pro Manager users export and returns 201', async () => {
      const res = mockRes();
      (sendMessageToQueue as jest.Mock).mockReturnValue('queue-message');

      await proManagerListUsersExport({ session: { user_email: 'pm@example.com' } } as any, res);

      expect(sendMessageToQueue).toHaveBeenCalledWith(
        {
          userEmail: 'pm@example.com',
          fileName: 'ProManagerUsers-20260102_120000.csv',
        },
        'proManagerUsers'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({ success: true, message: 'queue-message' });
    });

    it('returns 500 when queuing fails', async () => {
      const res = mockRes();
      (sendMessageToQueue as jest.Mock).mockImplementation(() => {
        throw new Error('queue down');
      });

      await proManagerListUsersExport({ session: { user_email: 'pm@example.com' } } as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('proManagerListUserDetailData', () => {
    it('returns selected user with org status', async () => {
      const res = mockRes();
      const mockAccount = { organization_id: 5, organization_status_id: 7 };
      const mockUser = { user_id: 3, organization_id: 5, name: 'Test User' };
      (ProManager.getAllAccountsList as jest.Mock).mockResolvedValue([mockAccount]);
      (ProManager.getAllUsersList as jest.Mock).mockResolvedValue([mockUser]);

      proManagerListUserDetailData({ params: { userId: '3', organizationId: '5' } } as any, res);

      // Wait for Promise.all to resolve
      await waitForPromises();

      expect(res.json.mock.calls[0][0].selectedUser).toEqual({
        user_id: 3,
        organization_id: 5,
        name: 'Test User',
        org_status: 7,
      });
    });

    it('returns null when user not found', async () => {
      const res = mockRes();
      (ProManager.getAllAccountsList as jest.Mock).mockResolvedValue([]);
      (ProManager.getAllUsersList as jest.Mock).mockResolvedValue([]);

      proManagerListUserDetailData(
        { params: { userId: '999', organizationId: '999' } } as any,
        res
      );

      // Wait for Promise.all to resolve
      await waitForPromises();

      expect(res.json.mock.calls[0][0].selectedUser).toBeNull();
    });

    it('handles errors and returns 500', async () => {
      const res = mockRes();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (ProManager.getAllAccountsList as jest.Mock).mockRejectedValue(new Error('DB error'));

      proManagerListUserDetailData({ params: { userId: '1', organizationId: '1' } } as any, res);

      // Wait for Promise.all to reject
      await waitForPromises();

      expect(res.status).toHaveBeenCalledWith(500);
      consoleSpy.mockRestore();
    });
  });

  describe('activatePendingAccount', () => {
    it('successfully activates account and returns redirect', async () => {
      const res = mockRes();
      (ProManager.activatePendingAccount as jest.Mock).mockResolvedValue(undefined);

      await activatePendingAccount({ body: { id: 1 } } as any, res);

      expect(ProManager.activatePendingAccount).toHaveBeenCalledWith({ body: { id: 1 } }, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ redirect: '/pro-manager-list' });
    });

    it('returns 400 for failedToActivateAccount error', async () => {
      const res = mockRes();
      (ProManager.activatePendingAccount as jest.Mock).mockRejectedValue({
        code: ERROR_CODES.failedToActivateAccount,
        systemMessage: 'sys',
        userMessage: 'usr',
      });

      await activatePendingAccount({ body: { id: 1 } } as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errorCode: ERROR_CODES.failedToActivateAccount,
        systemMessage: 'sys',
        userMessage: 'usr',
      });
    });

    it('returns 403 for userNotProManager error', async () => {
      const res = mockRes();
      (ProManager.activatePendingAccount as jest.Mock).mockRejectedValue({
        code: ERROR_CODES.userNotProManager,
        systemMessage: 'sys',
        userMessage: 'usr',
      });

      await activatePendingAccount({ body: { id: 1 } } as any, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        errorCode: ERROR_CODES.userNotProManager,
        systemMessage: 'sys',
        userMessage: 'usr',
      });
    });

    it('returns 500 for unexpected errors', async () => {
      const res = mockRes();
      (ProManager.activatePendingAccount as jest.Mock).mockRejectedValue(new Error('unexpected'));

      await activatePendingAccount({ body: { id: 1 } } as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        errorCode: 'internalServerError',
        systemMessage: expect.any(Error),
        userMessage: 'An unexpected error occurred. Please try again later.',
      });
    });
  });

  describe('reactivateAccount', () => {
    it('successfully reactivates account', async () => {
      const res = mockRes();
      (ProManager.reactivateAccount as jest.Mock).mockResolvedValue(undefined);

      await reactivateAccount({ body: { id: 3 } } as any, res);

      expect(ProManager.reactivateAccount).toHaveBeenCalledWith({ body: { id: 3 } }, 3);
      expect(res.send).toHaveBeenCalledWith({ redirect: '/pro-manager-list' });
    });

    it('returns 500 on error', async () => {
      const res = mockRes();
      (ProManager.reactivateAccount as jest.Mock).mockRejectedValue(new Error('failed'));

      await reactivateAccount({ body: { id: 3 } } as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        error: 'Failed to reactivate account.',
        details: expect.any(Error),
      });
    });
  });

  describe('deactivateAccount', () => {
    it('successfully deactivates account', async () => {
      const res = mockRes();
      (ProManager.deactivateAccount as jest.Mock).mockResolvedValue(undefined);

      await deactivateAccount({ body: { id: 2 } } as any, res);

      expect(ProManager.deactivateAccount).toHaveBeenCalledWith({ body: { id: 2 } }, 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ redirect: '/pro-manager-list' });
    });

    it('returns 400 for invalidStatusTransition error', async () => {
      const res = mockRes();
      (ProManager.deactivateAccount as jest.Mock).mockRejectedValue({
        code: ERROR_CODES.invalidStatusTransition,
        systemMessage: 'nope',
        userMessage: 'bad',
      });

      await deactivateAccount({ body: { id: 2 } } as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        errorCode: ERROR_CODES.invalidStatusTransition,
        systemMessage: 'nope',
        userMessage: 'bad',
      });
    });

    it('returns 403 for userNotProManager error', async () => {
      const res = mockRes();
      (ProManager.deactivateAccount as jest.Mock).mockRejectedValue({
        code: ERROR_CODES.userNotProManager,
        systemMessage: 'sys',
        userMessage: 'usr',
      });

      await deactivateAccount({ body: { id: 2 } } as any, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 500 for unexpected errors', async () => {
      const res = mockRes();
      (ProManager.deactivateAccount as jest.Mock).mockRejectedValue(new Error('unexpected'));

      await deactivateAccount({ body: { id: 2 } } as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('closePendingAccount', () => {
    it('successfully closes pending account', async () => {
      const res = mockRes();
      (ProManager.closePendingAccount as jest.Mock).mockResolvedValue(undefined);

      closePendingAccount({ body: { id: 4 } } as any, res);

      // Wait for promise to resolve
      await waitForPromises();

      expect(ProManager.closePendingAccount).toHaveBeenCalledWith({ body: { id: 4 } }, 4);
      expect(res.send).toHaveBeenCalledWith({ redirect: '/pro-manager-list' });
    });

    it('forwards error on failure', async () => {
      const res = mockRes();
      const error = { message: 'failed' };
      (ProManager.closePendingAccount as jest.Mock).mockRejectedValue(error);

      closePendingAccount({ body: { id: 4 } } as any, res);

      // Wait for promise to reject
      await waitForPromises();

      expect(res.send).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProAccount', () => {
    it('successfully updates account and calls all managers', async () => {
      const res = mockRes();
      (AccountManager.updatePendingAccount as jest.Mock).mockResolvedValue(undefined);
      (PolicyManager.uploadPendingPolicies as jest.Mock).mockResolvedValue(undefined);
      (ProManager.updateAccountSubscriptionStatus as jest.Mock).mockResolvedValue(undefined);

      const reqBody = {
        id: 1,
        org_name: 'n',
        org_address: 'a',
        org_website: 'w',
        parent_org_name: 'p',
        is_subsidiary: false,
        arr_org_classification_ids: [1, 2],
        policyUploadList: ['policy1'],
        policyName: ['Policy 1'],
        subscription_status_id: 2,
      };

      updateProAccount({ body: reqBody } as any, res);

      // Wait for Promise.all to resolve
      await waitForPromises();

      expect(AccountManager.updatePendingAccount).toHaveBeenCalled();
      expect(PolicyManager.uploadPendingPolicies).toHaveBeenCalled();
      expect(ProManager.updateAccountSubscriptionStatus).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ status: 'success' });
    });

    it('returns 500 on error', async () => {
      const res = mockRes();
      (AccountManager.updatePendingAccount as jest.Mock).mockRejectedValue(new Error('failed'));

      updateProAccount({ body: { id: 1 } } as any, res);

      // Wait for Promise.all to reject
      await waitForPromises();

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

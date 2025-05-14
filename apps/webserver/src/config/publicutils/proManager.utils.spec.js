/**
 * @jest-environment node
 */
const {
  activatePendingAccount,
  getAllAccountsList,
  getAllUsersList,
} = require('./proManager.utils');

jest.mock('./policyManager.utils');
jest.mock('./accountManager.utils');
jest.mock('./userManager.utils');
jest.mock('../langResources');
jest.mock('../publicutils/helper.utils');

jest.mock('../privateutils/speakeasy.utils');
jest.mock('../privateutils/cognito.utils');
jest.mock('../privateutils/ses.utils');
jest.mock('../privateutils/rollback.utils');
jest.mock('../privateutils/error.utils');
jest.mock('../privateutils/logger.utils');
jest.mock('../env/orgAccountStatus.constants', () => ({
  orgAccountStatus: {
    Pending: 1,
    Active: 2,
    Inactive: 3,
  },
}));

jest.mock('@wri-monorepos/sql', () => ({
  setOrganizationCustomAnalysisLimits: jest.fn(),
  setGlobalAnalysisLimit: jest.fn(),
  setOrganizationRenewalTime: jest.fn(),
}));

jest.mock('../privateutils/sql.utils', () => ({
  executeSystemStoredProcedure: jest.fn(),
  executeSystemQuery: jest.fn(),
}));

const UserManager = require('./userManager.utils');
const AccountManager = require('./accountManager.utils');
const PolicyManager = require('./policyManager.utils');
const langResources = require('../langResources');
const Helper = require('../publicutils/helper.utils');
const config = require('../config');

const errorUtils = require('../privateutils/error.utils');
const sqlUtils = require('../privateutils/sql.utils');
const awsCognito = require('../privateutils/cognito.utils');
const awsSes = require('../privateutils/ses.utils');
const rollbackUtils = require('../privateutils/rollback.utils');
const speakEasy = require('../privateutils/speakeasy.utils');
const { orgAccountStatus } = require('../env/orgAccountStatus.constants');

describe('Pro Manager Utils Tests', () => {
  describe('getAllAccountsList', () => {
    const req = {
      session: {
        user_email: 'test@example.com',
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('rejects if user is not a Pro Manager', async () => {
      UserManager.isProManager = jest.fn().mockReturnValue(false);
      const errorObj = { message: 'not pro' };

      const createErrorMessage = jest.fn().mockReturnValue(errorObj);
      errorUtils.createErrorMessage = createErrorMessage;

      langResources.getResourceString = jest.fn().mockReturnValue('login failed');

      await expect(getAllAccountsList(req)).rejects.toEqual(errorObj);
      expect(createErrorMessage).toHaveBeenCalled();
    });

    it('resolves with account list if user is Pro Manager', async () => {
      // Mock the UserManager function
      UserManager.isProManager = jest.fn().mockReturnValue(true);

      // Mock the results to be returned by the stored procedure
      const mockResults = [{ id: 1 }, { id: 2 }];
      sqlUtils.executeSystemStoredProcedure = jest.fn().mockResolvedValue(mockResults);

      // Log req to ensure it's set up properly
      const req = {
        session: {
          ispromanager: true,
        },
        user: {
          role: 'Pro Manager',
        },
      };
      const result = await getAllAccountsList(req);
      expect(result).toEqual(mockResults); // Check if the result matches
    });

    it('rejects if stored procedure throws', async () => {
      UserManager.isProManager = jest.fn().mockReturnValue(true);

      const err = new Error('Database error');
      sqlUtils.executeSystemStoredProcedure = jest.fn().mockRejectedValue(err);

      const errorObj = { message: 'db error' };
      errorUtils.createErrorMessage = jest.fn().mockReturnValue(errorObj);

      await expect(getAllAccountsList(req)).rejects.toEqual(errorObj);
      expect(errorUtils.createErrorMessage).toHaveBeenCalled();
    });
  });

  describe('getAllUsersList', () => {
    const mockReq = {
      session: {
        user_email: 'test@example.com',
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('rejects if user is not a Pro Manager', async () => {
      UserManager.isProManager.mockReturnValue(false);
      langResources.getResourceString.mockReturnValue('Not authorized');
      errorUtils.createErrorMessage.mockReturnValue({ message: 'user not pro' });

      await expect(getAllUsersList(mockReq)).rejects.toEqual({ message: 'user not pro' });

      expect(UserManager.isProManager).toHaveBeenCalledWith(mockReq);
      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.userNotProManager,
        'Not authorized',
        expect.stringContaining('test@example.com')
      );
    });

    it('resolves with user list if user is a Pro Manager', async () => {
      UserManager.isProManager.mockReturnValue(true);
      const mockData = [{ id: 1, name: 'Alice' }];
      sqlUtils.executeSystemStoredProcedure.mockResolvedValue(mockData);

      const result = await getAllUsersList(mockReq);

      expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspGetAllUsersList'
      );
      expect(result).toEqual(mockData);
    });

    it('rejects if stored procedure throws error', async () => {
      UserManager.isProManager.mockReturnValue(true);
      const error = new Error('DB failure');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValue(error);
      errorUtils.createErrorMessage.mockReturnValue({ message: 'query failed' });

      await expect(getAllUsersList(mockReq)).rejects.toEqual({ message: 'query failed' });

      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.failedToGetAllUsersList,
        'Failed to get all users list',
        error
      );
    });
  });

  describe('activatePendingAccount', () => {
    let mockReq;
    let pendingaccount_id;

    beforeEach(() => {
      mockReq = {
        session: { user_email: 'test@example.com' },
      };
      pendingaccount_id = 123;

      jest.clearAllMocks();
    });

    it('resolves successfully with valid input', async () => {
      const pendingaccount_id = 123;
      const mockReq = {
        session: { user_email: 'admin@example.com' },
      };

      // Mock UserManager.isProManager to return true
      jest.spyOn(UserManager, 'isProManager').mockReturnValue(true);

      // Mock get helper functions
      jest.spyOn(UserManager, 'getTitles').mockReturnValue([{ id: 1, title: 'Manager' }]);
      jest
        .spyOn(UserManager, 'getCommodities')
        .mockReturnValue([{ id: 10, commmodity_name: 'Cocoa' }]);
      jest
        .spyOn(UserManager, 'getGeographies')
        .mockReturnValue([{ id: 20, geography_name: 'Argentina' }]);
      jest
        .spyOn(AccountManager, 'getClassifications')
        .mockReturnValue([{ id: 30, classification_name: 'Private' }]);

      // Mock stored procedure for uspGetAllAccountsList
      jest
        .spyOn(sqlUtils, 'executeSystemStoredProcedure')
        .mockImplementation((req, spName, params) => {
          if (spName === 'uspGetAllAccountsList') {
            return Promise.resolve([
              {
                organization_id: pendingaccount_id,
                organization_name: 'TestOrg',
                organization_status_id: orgAccountStatus.Pending,
              },
            ]);
          }

          if (spName === 'uspGetPendingAccountInformation') {
            return Promise.resolve([
              {
                id: 1,
                title_id: 1,
                other_title: '',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '1234567890',
                organization_name: 'TestOrg',
                organization_is_subsidiary: false,
                organization_parent: '',
                organization_website: '',
                organization_address: '',
              },
            ]);
          }

          if (spName === 'uspGetPendingUserCommodities') {
            return Promise.resolve([{ commodity_id: 10 }]);
          }

          if (spName === 'uspGetPendingUserGeographies') {
            return Promise.resolve([{ geography_id: 20 }]);
          }

          if (spName === 'uspGetPendingAccountPolicies') {
            return Promise.resolve([{ document_name: 'Policy1' }]);
          }

          if (spName === 'uspGetPendingAccountClassification') {
            return Promise.resolve([{ classification_id: 30 }]);
          }

          if (spName === 'uspActivatePendingAccount') {
            return Promise.resolve([
              { ManagerEmail: 'john@example.com', UserExists: 0, orgID: 777 },
            ]);
          }

          if (spName === 'uspRemovePendingOrganization') {
            return Promise.resolve([]);
          }

          return Promise.resolve([]);
        });

      // Mock supporting calls
      jest.spyOn(sqlUtils, 'executeSystemQuery').mockResolvedValue(undefined);
      jest.spyOn(PolicyManager, 'movePolicy').mockResolvedValue(undefined);
      jest.spyOn(awsCognito, 'createUser').mockResolvedValue(undefined);
      jest.spyOn(awsSes, 'sendEmail').mockResolvedValue(true);
      jest.spyOn(speakEasy, 'createSecret').mockReturnValue('fake-secret');

      // Run and assert
      await expect(activatePendingAccount(mockReq, pendingaccount_id, true)).resolves.toBe(true);
    });

    it('rejects if user is not a Pro Manager', async () => {
      UserManager.isProManager.mockReturnValue(false);
      langResources.getResourceString.mockReturnValue('Access denied');
      const fakeError = { error: 'Not a Pro Manager' };
      errorUtils.createErrorMessage.mockReturnValue(fakeError);

      await expect(activatePendingAccount(mockReq, pendingaccount_id, true)).rejects.toEqual(
        fakeError
      );
    });

    it('rejects if organization name already exists', async () => {
      sqlUtils.executeSystemStoredProcedure.mockResolvedValueOnce([
        { id: 1, title: 'Example Org', organization_status_id: orgAccountStatus.Pending },
      ]);

      // Mock getOrganizationByName to simulate conflict
      sqlUtils.getOrganizationByName = jest.fn().mockResolvedValue({
        id: 2,
        title: 'Example Org',
      });

      await expect(activatePendingAccount(mockReq, pendingaccount_id, true)).rejects.toEqual(
        new errorUtils.createErrorMessage('Organization name already exists')
      );
    });
  });
});

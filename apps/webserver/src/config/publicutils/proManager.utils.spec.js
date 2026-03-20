/**
 * @jest-environment node
 */

jest.mock('./policyManager.utils');
jest.mock('./accountManager.utils');
jest.mock('./userManager.utils');
jest.mock('./authenticationManager.utils');
jest.mock('../langResources');
jest.mock('../privateutils/speakeasy.utils');
jest.mock('../privateutils/cognito.utils');
jest.mock('../privateutils/ses.utils');
jest.mock('../privateutils/error.utils');
jest.mock('../privateutils/rollback.utils');
jest.mock('../privateutils/logger.utils');
jest.mock('../privateutils/sql.utils', () => ({
  executeSystemStoredProcedure: jest.fn(),
  executeSystemQuery: jest.fn(),
}));

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
  Organization: jest.fn(),
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn(),
  })),
}));

const {
  activatePendingAccount,
  checkOrgName,
  closePendingAccount,
  deactivateAccount,
  deleteOrganization,
  deletePendingAccountRequest,
  deleteUser,
  getAccountSubscriptionStatus,
  getAllAccountsList,
  getAllUsersList,
  reactivateAccount,
  updateAccountAnalysisLimits,
  updateAccountSubscriptionStatus,
  updateGlobalAnalysisLimits,
  updateOrgName,
  updatePendingAccountUser,
} = require('./proManager.utils');

const UserManager = require('./userManager.utils');
const AccountManager = require('./accountManager.utils');
const PolicyManager = require('./policyManager.utils');
const langResources = require('../langResources');
const errorUtils = require('../privateutils/error.utils');
const sqlUtils = require('../privateutils/sql.utils');
const awsCognito = require('../privateutils/cognito.utils');
const awsSes = require('../privateutils/ses.utils');
const speakEasy = require('../privateutils/speakeasy.utils');
const { orgAccountStatus } = require('../env/orgAccountStatus.constants');
const {
  setOrganizationCustomAnalysisLimits,
  setGlobalAnalysisLimit,
} = require('@wri-monorepos/sql');

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

    it('should reject if user is not a Pro Manager', async () => {
      UserManager.isProManager = jest.fn().mockReturnValue(false);
      const errorObj = { message: 'not pro' };

      const createErrorMessage = jest.fn().mockReturnValue(errorObj);
      errorUtils.createErrorMessage = createErrorMessage;

      langResources.getResourceString = jest.fn().mockReturnValue('login failed');

      await expect(getAllAccountsList(req)).rejects.toEqual(errorObj);
      expect(createErrorMessage).toHaveBeenCalled();
    });

    it('should resolve with account list if user is Pro Manager', async () => {
      UserManager.isProManager = jest.fn().mockReturnValue(true);

      // Mock the results to be returned by the stored procedure
      const mockResults = [{ id: 1 }, { id: 2 }];
      sqlUtils.executeSystemStoredProcedure = jest.fn().mockResolvedValue(mockResults);

      const req = {
        session: {
          ispromanager: true,
        },
        user: {
          role: 'Pro Manager',
        },
      };
      const result = await getAllAccountsList(req);
      expect(result).toEqual(mockResults);
    });

    it('should reject if stored procedure throws', async () => {
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

    it('should reject if user is not a Pro Manager', async () => {
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

    it('should resolve with user list if user is a Pro Manager', async () => {
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

    it('should reject if stored procedure throws error', async () => {
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

    it('should resolve successfully with valid input', async () => {
      const pendingaccount_id = 123;
      const mockReq = {
        session: { user_email: 'admin@example.com' },
      };

      jest.spyOn(UserManager, 'isProManager').mockReturnValue(true);

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

      jest
        .spyOn(sqlUtils, 'executeSystemStoredProcedure')
        .mockImplementation((req, spName, params) => {
          switch (spName) {
            case 'uspGetAllAccountsList':
              return Promise.resolve([
                {
                  organization_id: pendingaccount_id,
                  organization_name: 'TestOrg',
                  organization_status_id: orgAccountStatus.Pending,
                },
              ]);
            case 'uspGetPendingAccountInformation':
              return Promise.resolve([
                {
                  id: 1,
                  title_id: 1,
                  other_title: '',
                  first_name: 'John',
                  last_name: 'Test',
                  email: 'john@example.com',
                  phone: '1234567890',
                  organization_name: 'TestOrg',
                  organization_is_subsidiary: false,
                  organization_parent: '',
                  organization_website: '',
                  organization_address: '',
                },
              ]);
            case 'uspGetPendingUserCommodities':
              return Promise.resolve([{ commodity_id: 10 }]);
            case 'uspGetPendingUserGeographies':
              return Promise.resolve([{ geography_id: 20 }]);
            case 'uspGetPendingAccountPolicies':
              return Promise.resolve([{ document_name: 'Policy1' }]);
            case 'uspGetPendingAccountClassification':
              return Promise.resolve([{ classification_id: 30 }]);
            case 'uspActivatePendingAccount':
              return Promise.resolve([
                { ManagerEmail: 'john@example.com', UserExists: 0, orgID: 777 },
              ]);
            case 'uspRemovePendingOrganization':
              return Promise.resolve([]);
            default:
              return Promise.resolve([]);
          }
        });

      jest.spyOn(sqlUtils, 'executeSystemQuery').mockResolvedValue(undefined);
      jest.spyOn(PolicyManager, 'movePolicy').mockResolvedValue(undefined);
      jest.spyOn(awsCognito, 'createUser').mockResolvedValue(undefined);
      jest.spyOn(awsSes, 'sendEmail').mockResolvedValue(true);
      jest.spyOn(speakEasy, 'createSecret').mockReturnValue('fake-secret');

      await expect(activatePendingAccount(mockReq, pendingaccount_id, true)).resolves.toBe(true);
    });

    it('should reject if user is not a Pro Manager', async () => {
      UserManager.isProManager.mockReturnValue(false);
      langResources.getResourceString.mockReturnValue('Access denied');
      const fakeError = { error: 'Not a Pro Manager' };
      errorUtils.createErrorMessage.mockReturnValue(fakeError);

      await expect(activatePendingAccount(mockReq, pendingaccount_id, true)).rejects.toEqual(
        fakeError
      );
    });

    it('should reject if organization name already exists', async () => {
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

    it('should call uspActivatePendingAccount and handle filtered users correctly', async () => {
      const mockReq = { session: { user_email: 'admin@example.com' } };
      const pendingaccount_id = 123;

      // Mocks for required functions
      jest.spyOn(UserManager, 'isProManager').mockReturnValue(true);
      jest.spyOn(UserManager, 'getTitles').mockReturnValue([{ id: 1, title: 'Manager' }]);
      jest.spyOn(UserManager, 'getCommodities').mockReturnValue([]);
      jest.spyOn(UserManager, 'getGeographies').mockReturnValue([]);
      jest.spyOn(AccountManager, 'getClassifications').mockReturnValue([]);

      jest.spyOn(speakEasy, 'createSecret').mockReturnValue('fake-secret');
      jest.spyOn(PolicyManager, 'movePolicy').mockResolvedValue(undefined);
      jest.spyOn(awsCognito, 'createUser').mockResolvedValue(undefined);
      jest.spyOn(sqlUtils, 'executeSystemQuery').mockResolvedValue(undefined);
      jest.spyOn(awsSes, 'sendEmail').mockResolvedValue(true);

      const activateSpy = jest
        .spyOn(sqlUtils, 'executeSystemStoredProcedure')
        .mockImplementation((req, spName, params) => {
          switch (spName) {
            case 'uspGetAllAccountsList':
              return Promise.resolve([
                {
                  organization_id: pendingaccount_id,
                  organization_name: 'TestOrg',
                  organization_status_id: orgAccountStatus.Pending,
                },
                {
                  organization_id: 999,
                  organization_name: 'ExistingOrg',
                  organization_status_id: orgAccountStatus.Active,
                },
              ]);
            case 'uspGetPendingAccountInformation':
              return Promise.resolve([
                {
                  id: 1,
                  title_id: 1,
                  other_title: '',
                  first_name: 'Test',
                  last_name: 'User',
                  email: 'test@example.com',
                  phone: '1234567890',
                  organization_name: 'TestOrg',
                  organization_is_subsidiary: false,
                  organization_parent: '',
                  organization_website: '',
                  organization_address: '',
                },
              ]);
            case 'uspGetPendingUserCommodities':
            case 'uspGetPendingUserGeographies':
            case 'uspGetPendingAccountPolicies':
            case 'uspGetPendingAccountClassification':
              return Promise.resolve([]);
            case 'uspActivatePendingAccount':
              return Promise.resolve([
                {
                  ManagerEmail: 'test@example.com',
                  UserExists: 0,
                  orgID: 555,
                },
              ]);
            case 'uspRemovePendingOrganization':
              return Promise.resolve([]);
            default:
              return Promise.resolve([]);
          }
        });

      await expect(activatePendingAccount(mockReq, pendingaccount_id, true)).resolves.toBe(true);

      expect(activateSpy).toHaveBeenCalledWith(
        mockReq,
        'uspActivatePendingAccount',
        expect.arrayContaining([
          expect.objectContaining({ field: 'PendingAccountID', value: pendingaccount_id }),
        ])
      );
    });
  });

  describe('updatePendingAccountUser', () => {
    const mockReq = {};
    const user_id = 123;
    const user_first_name = 'John';
    const user_middle_initial = '';
    const user_last_name = 'Test';
    const user_email = 'john@example.com';
    const user_phone = '123-456-7890';
    const user_title_id = 1;
    const other_title = 'Manager';
    const arr_user_geography_ids = [1, 2, 3];
    const arr_user_commodity_ids = [4, 5, 6];

    it('should resolve successfully when the stored procedure executes without errors', async () => {
      sqlUtils.executeSystemStoredProcedure.mockResolvedValueOnce(true);

      await expect(
        updatePendingAccountUser(
          mockReq,
          user_id,
          user_first_name,
          user_middle_initial,
          user_last_name,
          user_email,
          user_phone,
          user_title_id,
          other_title,
          arr_user_geography_ids,
          arr_user_commodity_ids
        )
      ).resolves.toBe(true);
    });

    it('should reject with an error message when the stored procedure fails', async () => {
      const error = new Error('Database error');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValueOnce(error);

      const errorMessage = new errorUtils.createErrorMessage(
        mockReq,
        errorUtils.ERROR_CODES.failedToUpdatePendingAccountUser,
        'Failed to update pending account user',
        error
      );

      await expect(
        updatePendingAccountUser(
          mockReq,
          user_id,
          user_first_name,
          user_middle_initial,
          user_last_name,
          user_email,
          user_phone,
          user_title_id,
          other_title,
          arr_user_geography_ids,
          arr_user_commodity_ids
        )
      ).rejects.toEqual(errorMessage);
    });
  });

  describe('deletePendingAccountRequest', () => {
    const mockReq = {
      session: { user_email: 'testuser@example.com' },
    };
    const pendingaccount_id = 123;

    it('should reject if the user is not a Pro Manager', async () => {
      UserManager.isProManager.mockReturnValueOnce(false);

      const userMessage = 'User not a Pro Manager';
      const sysMessage = `UserEmail: ${mockReq.session.user_email} is not a GFW Pro Root User.`;
      const errorObject = new errorUtils.createErrorMessage(
        mockReq,
        errorUtils.ERROR_CODES.userNotProManager,
        userMessage,
        sysMessage
      );

      await expect(deletePendingAccountRequest(mockReq, pendingaccount_id)).rejects.toEqual(
        errorObject
      );
    });

    it('should resolve successfully when the stored procedure executes without errors', async () => {
      UserManager.isProManager.mockReturnValueOnce(true);
      sqlUtils.executeSystemStoredProcedure.mockResolvedValueOnce(true);

      await expect(deletePendingAccountRequest(mockReq, pendingaccount_id)).resolves.toBe(true);
    });

    it('should reject with an error message when the stored procedure fails', async () => {
      UserManager.isProManager.mockReturnValueOnce(true);

      const error = new Error('Database error');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValueOnce(error);

      const errorMessage = new errorUtils.createErrorMessage(
        mockReq,
        errorUtils.ERROR_CODES.failedToDeletePendingAccountRequest,
        'Failed to delete pending account request',
        error
      );

      await expect(deletePendingAccountRequest(mockReq, pendingaccount_id)).rejects.toEqual(
        errorMessage
      );
    });
  });

  describe('deleteOrganization', () => {
    const mockReq = {
      session: { user_email: 'testuser@example.com' },
    };
    const orgName = 'Test Organization';

    it('should reject if the user is not a Pro Manager', async () => {
      UserManager.isProManager.mockReturnValueOnce(false);

      const userMessage = 'User not a Pro Manager';
      const sysMessage = `UserEmail: ${mockReq.session.user_email} is not a GFW Pro Root User.`;
      const errorObject = new errorUtils.createErrorMessage(
        mockReq,
        errorUtils.ERROR_CODES.userNotProManager,
        userMessage,
        sysMessage
      );

      await expect(deleteOrganization(mockReq, orgName)).rejects.toEqual(errorObject);
    });

    it('should resolve successfully when the stored procedure executes without errors', async () => {
      UserManager.isProManager.mockReturnValueOnce(true);
      sqlUtils.executeSystemStoredProcedure.mockResolvedValueOnce(true);

      await expect(deleteOrganization(mockReq, orgName)).resolves.toBe(true);
    });

    it('should reject with an error message when the stored procedure fails', async () => {
      UserManager.isProManager.mockReturnValueOnce(true);

      const error = new Error('Database error');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValueOnce(error);

      const errorMessage = new errorUtils.createErrorMessage(
        mockReq,
        errorUtils.ERROR_CODES.failedToDeleteOrganization,
        'Failed to delete organization',
        error
      );

      await expect(deleteOrganization(mockReq, orgName)).rejects.toEqual(errorMessage);
    });
  });

  describe('deleteUser', () => {
    const mockReq = {
      session: { user_email: 'testuser@example.com' },
    };
    const email = 'userToDelete@example.com';

    it('should reject if the user is not a Pro Manager', async () => {
      UserManager.isProManager.mockReturnValueOnce(false);

      const userMessage = 'User not a Pro Manager';
      const sysMessage = `UserEmail: ${mockReq.session.user_email} is not a GFW Pro Root User.`;
      const errorObject = new errorUtils.createErrorMessage(
        mockReq,
        errorUtils.ERROR_CODES.userNotProManager,
        userMessage,
        sysMessage
      );

      await expect(deleteUser(mockReq, email)).rejects.toEqual(errorObject);
    });

    it('should resolve successfully when the stored procedure executes without errors', async () => {
      UserManager.isProManager.mockReturnValueOnce(true);
      sqlUtils.executeSystemStoredProcedure.mockResolvedValueOnce(true);

      await expect(deleteUser(mockReq, email)).resolves.toBe(true);
    });

    it('should reject with an error message when the stored procedure fails', async () => {
      UserManager.isProManager.mockReturnValueOnce(true);

      const error = new Error('Database error'); // Mock the stored procedure to reject with an error
      sqlUtils.executeSystemStoredProcedure.mockRejectedValueOnce(error);

      const errorMessage = new errorUtils.createErrorMessage(
        mockReq,
        errorUtils.ERROR_CODES.failedToDeleteUser,
        'Failed to delete user',
        error
      );

      await expect(deleteUser(mockReq, email)).rejects.toEqual(errorMessage);
    });
  });

  describe('reactivateAccount', () => {
    const mockReq = {};
    const organization_id = 123;

    it('should resolve successfully when the stored procedure executes without errors', async () => {
      sqlUtils.executeSystemStoredProcedure.mockResolvedValueOnce(true);

      await expect(reactivateAccount(mockReq, organization_id)).resolves.toBe(true);
    });

    it('should reject with an error when the stored procedure fails', async () => {
      const error = new Error('Database error');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValueOnce(error);

      await expect(reactivateAccount(mockReq, organization_id)).rejects.toEqual(error);
    });
  });

  describe('deactivateAccount', () => {
    let mockReq;
    const organization_id = 123;

    beforeEach(() => {
      mockReq = { session: { user_email: 'admin@example.com' } };
      jest.clearAllMocks();
    });

    it('should resolve successfully when the account is deactivated', async () => {
      const { getOrganizationStatus } = require('./authenticationManager.utils');
      getOrganizationStatus.mockResolvedValue(orgAccountStatus.Active);

      // Mock the update call to succeed
      sqlUtils.executeSystemStoredProcedure.mockResolvedValueOnce([{}]);

      await expect(deactivateAccount(mockReq, organization_id)).resolves.toBe(true);
    });

    it('should reject with an error if the database operation fails', async () => {
      const { getOrganizationStatus } = require('./authenticationManager.utils');
      getOrganizationStatus.mockResolvedValue(orgAccountStatus.Active);

      const mockError = new Error('Database error');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValue(mockError);

      await expect(deactivateAccount(mockReq, organization_id)).rejects.toMatchObject({
        code: errorUtils.ERROR_CODES.failedToDeactivateAccount,
        userMessage: 'Failed to deactivate account',
      });
    });
  });

  describe('getAccountSubscriptionStatus', () => {
    let mockReq;
    const organizationId = 123;

    beforeEach(() => {
      mockReq = { session: { user_email: 'test@example.com' } };
    });

    it('should resolve with the subscription status when the database operation is successful', async () => {
      const mockResult = { organization_status_id: 2 };
      sqlUtils.executeSystemStoredProcedure.mockResolvedValue([mockResult]);

      await expect(getAccountSubscriptionStatus(mockReq, organizationId)).resolves.toEqual([
        mockResult,
      ]);
    });
  });

  describe('updateAccountSubscriptionStatus', () => {
    const mockReq = { user: { id: 123 } };
    const organizationId = 1;
    const newSubscriptionStatusId = 2;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should resolve true when stored procedure succeeds', async () => {
      sqlUtils.executeSystemStoredProcedure.mockResolvedValue();

      await expect(
        updateAccountSubscriptionStatus(mockReq, organizationId, newSubscriptionStatusId)
      ).resolves.toBe(true);

      expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspSetOrganizationSubscriptionStatus',
        [
          { field: 'organizationId', type: expect.anything(), value: organizationId },
          {
            field: 'subscriptionStatusId',
            type: expect.anything(),
            value: newSubscriptionStatusId,
          },
        ]
      );
    });

    it('should reject with an error object when stored procedure fails', async () => {
      const mockError = new Error('Database failure');
      const expectedError = { error: 'error example' };

      sqlUtils.executeSystemStoredProcedure.mockRejectedValue(mockError);
      errorUtils.createErrorMessage.mockReturnValue(expectedError);

      await expect(
        updateAccountSubscriptionStatus(mockReq, organizationId, newSubscriptionStatusId)
      ).rejects.toEqual(expectedError);

      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.failedToUpdateAccountSubscriptionStatus,
        'Failed to update account subscription status',
        mockError
      );
    });
  });

  describe('updateGlobalAnalysisLimits', () => {
    const mockReq = { user: { id: 123 } };
    const payload = {
      subscriptionStatusId: 1,
      MaxAreaPerList: 100.5,
      MaxAreaAnalyzeablePerYear: 500.25,
      tokens_per_year: 10,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should resolve with payload when query succeeds', async () => {
      sqlUtils.executeSystemQuery.mockResolvedValue();

      await expect(updateGlobalAnalysisLimits(mockReq, payload)).resolves.toEqual(payload);

      expect(sqlUtils.executeSystemQuery).toHaveBeenCalledWith(setGlobalAnalysisLimit, [
        {
          field: 'subscriptionStatusId',
          type: expect.anything(),
          value: payload.subscriptionStatusId,
        },
        { field: 'MaxAreaPerList', type: expect.anything(), value: payload.MaxAreaPerList },
        {
          field: 'MaxAreaAnalyzeablePerYear',
          type: expect.anything(),
          value: payload.MaxAreaAnalyzeablePerYear,
        },
        {
          field: 'tokens_per_year',
          type: expect.anything(),
          value: payload.tokens_per_year,
        },
      ]);
    });

    it('throws an error object when query fails', async () => {
      const mockError = new Error('DB failure');
      const formattedError = { error: 'formatted error' };

      sqlUtils.executeSystemQuery.mockRejectedValue(mockError);
      errorUtils.createErrorMessage.mockReturnValue(formattedError);

      await expect(updateGlobalAnalysisLimits(mockReq, payload)).rejects.toThrow(
        new Error(formattedError)
      );

      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.failedToUpdateGlobalAnalysisLimit,
        'Failed to update global analysis limit',
        mockError
      );
    });
  });

  describe('updateAccountAnalysisLimits', () => {
    const mockReq = { user: { id: 42 } };
    const payload = {
      organizationId: 10,
      MaxAreaPerList: 123.45,
      MaxAreaAnalyzeablePerYear: 678.9,
      tokens_per_year: 50,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should resolve with payload when query succeeds', async () => {
      sqlUtils.executeSystemQuery.mockResolvedValue();

      await expect(updateAccountAnalysisLimits(mockReq, payload)).resolves.toEqual(payload);

      expect(sqlUtils.executeSystemQuery).toHaveBeenCalledWith(
        setOrganizationCustomAnalysisLimits,
        [
          { field: 'OrgID', type: expect.anything(), value: payload.organizationId },
          { field: 'MaxAreaPerList', type: expect.anything(), value: payload.MaxAreaPerList },
          {
            field: 'MaxAreaAnalyzeablePerYear',
            type: expect.anything(),
            value: payload.MaxAreaAnalyzeablePerYear,
          },
          {
            field: 'tokens_per_year',
            type: expect.anything(),
            value: payload.tokens_per_year,
          },
        ]
      );
    });

    it('throws an error object when query fails', async () => {
      const dbError = new Error('DB failure');
      const formattedError = { error: 'formatted error' };

      sqlUtils.executeSystemQuery.mockRejectedValue(dbError);
      errorUtils.createErrorMessage.mockReturnValue(formattedError);

      await expect(updateAccountAnalysisLimits(mockReq, payload)).rejects.toThrow(
        new Error(formattedError)
      );

      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.failedToUpdateAccountCustomAnalysisLimits,
        'Failed to update account custom analysis limits',
        dbError
      );
    });
  });

  describe('closePendingAccount', () => {
    const mockReq = {
      session: { user_email: 'admin@example.com' },
    };
    const pendingAccountId = 123;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully close a pending account', async () => {
      const mockResult = [{ id: pendingAccountId, status: 'closed' }];
      sqlUtils.executeSystemStoredProcedure.mockResolvedValue(mockResult);

      await expect(closePendingAccount(mockReq, pendingAccountId)).resolves.toBe(true);

      expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspClosePendingAccount',
        [{ field: 'pendingAccountId', type: expect.anything(), value: pendingAccountId }]
      );
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValue(mockError);
      errorUtils.createErrorMessage.mockReturnValue({ error: 'Failed to close account' });

      await expect(closePendingAccount(mockReq, pendingAccountId)).rejects.toEqual({
        error: 'Failed to close account',
      });

      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.failedToDeletePendingAccountRequest,
        'Failed to delete pending account request',
        mockError
      );
    });
  });

  describe('updateOrgName', () => {
    const mockReq = {
      session: { user_email: 'admin@example.com' },
    };
    const organizationId = 456;
    const newOrgName = 'Updated Organization Name';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should reject if user is not a Pro Manager', async () => {
      UserManager.isProManager.mockReturnValue(false);
      langResources.getResourceString.mockReturnValue('User is not an admin');
      const errorObj = { error: 'Not authorized' };
      errorUtils.createErrorMessage.mockReturnValue(errorObj);

      await expect(updateOrgName(mockReq, organizationId, newOrgName)).rejects.toEqual(errorObj);

      expect(UserManager.isProManager).toHaveBeenCalledWith(mockReq);
      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.userNotProManager,
        'User is not an admin',
        expect.stringContaining('not authorized')
      );
    });

    it('should successfully update organization name', async () => {
      UserManager.isProManager.mockReturnValue(true);
      const mockResult = { id: organizationId, organization_name: newOrgName };
      sqlUtils.executeSystemStoredProcedure.mockResolvedValue([mockResult]);

      const result = await updateOrgName(mockReq, organizationId, newOrgName);

      expect(result).toEqual(mockResult);
      expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
        mockReq,
        'uspUpdateOrgName',
        [
          { field: 'OrganizationId', type: expect.anything(), value: organizationId },
          { field: 'OrganizationName', type: expect.anything(), value: newOrgName },
        ]
      );
    });

    it('should handle database errors', async () => {
      UserManager.isProManager.mockReturnValue(true);
      const dbError = new Error('Constraint violation');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValue(dbError);
      const errorObj = { error: 'Failed to update' };
      errorUtils.createErrorMessage.mockReturnValue(errorObj);

      await expect(updateOrgName(mockReq, organizationId, newOrgName)).rejects.toEqual(errorObj);

      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.failedToUpdateOrganization,
        'Failed to update organization name',
        dbError
      );
    });

    it('should validate organization name with empty string', async () => {
      UserManager.isProManager.mockReturnValue(true);
      const emptyName = '';
      sqlUtils.executeSystemStoredProcedure.mockResolvedValue([
        { id: organizationId, organization_name: emptyName },
      ]);

      await expect(updateOrgName(mockReq, organizationId, emptyName)).resolves.toBeDefined();
    });
  });

  describe('checkOrgName', () => {
    const mockReq = {
      session: { user_email: 'test@example.com' },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return true if organization name exists', async () => {
      const orgName = 'Existing Organization';
      const mockOrg = { id: 1, organization_name: orgName };

      // Mock the TypeORM query builder chain
      const mockGetOne = jest.fn().mockResolvedValue(mockOrg);
      const mockWhere = jest.fn().mockReturnValue({ getOne: mockGetOne });
      const mockCreateQueryBuilder = jest.fn().mockReturnValue({ where: mockWhere });
      const mockGetRepository = jest.fn().mockReturnValue({
        createQueryBuilder: mockCreateQueryBuilder,
      });
      const mockGetConnection = jest.fn().mockResolvedValue({
        getRepository: mockGetRepository,
      });

      // Mock the ClientStoreConnection instance
      const { ClientStoreConnection } = require('@wri-monorepos/sql');
      ClientStoreConnection.mockImplementation(() => ({
        getConnection: mockGetConnection,
      }));

      const result = await checkOrgName(mockReq, orgName);

      expect(result).toBe(true);
    });

    it('should return false if organization name is available', async () => {
      const orgName = 'Available Organization';

      // Mock the TypeORM query builder chain to return null
      const mockGetOne = jest.fn().mockResolvedValue(null);
      const mockWhere = jest.fn().mockReturnValue({ getOne: mockGetOne });
      const mockCreateQueryBuilder = jest.fn().mockReturnValue({ where: mockWhere });
      const mockGetRepository = jest.fn().mockReturnValue({
        createQueryBuilder: mockCreateQueryBuilder,
      });
      const mockGetConnection = jest.fn().mockResolvedValue({
        getRepository: mockGetRepository,
      });

      const { ClientStoreConnection } = require('@wri-monorepos/sql');
      ClientStoreConnection.mockImplementation(() => ({
        getConnection: mockGetConnection,
      }));

      const result = await checkOrgName(mockReq, orgName);

      expect(result).toBe(false);
    });

    it('should be case-insensitive', async () => {
      const orgName = 'TeSt OrGaNiZaTiOn';

      const mockGetOne = jest.fn().mockResolvedValue({ id: 1, organization_name: orgName });
      const mockWhere = jest.fn((query, params) => {
        // Verify that the query uses LOWER()
        expect(query).toContain('LOWER');
        expect(params.name).toBe(orgName);
        return { getOne: mockGetOne };
      });
      const mockCreateQueryBuilder = jest.fn().mockReturnValue({ where: mockWhere });
      const mockGetRepository = jest.fn().mockReturnValue({
        createQueryBuilder: mockCreateQueryBuilder,
      });
      const mockGetConnection = jest.fn().mockResolvedValue({
        getRepository: mockGetRepository,
      });

      const { ClientStoreConnection } = require('@wri-monorepos/sql');
      ClientStoreConnection.mockImplementation(() => ({
        getConnection: mockGetConnection,
      }));

      await checkOrgName(mockReq, orgName);

      expect(mockWhere).toHaveBeenCalled();
    });

    it('should handle database connection errors', async () => {
      const orgName = 'Test Organization';
      const dbError = new Error('Connection timeout');

      const mockGetConnection = jest.fn().mockRejectedValue(dbError);

      const { ClientStoreConnection } = require('@wri-monorepos/sql');
      ClientStoreConnection.mockImplementation(() => ({
        getConnection: mockGetConnection,
      }));

      errorUtils.createErrorMessage.mockReturnValue({ error: 'DB error' });

      await expect(checkOrgName(mockReq, orgName)).rejects.toEqual({ error: 'DB error' });

      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.failedToCheckOrganizationName,
        'Failed to check organization name',
        dbError
      );
    });
  });

  describe('activatePendingAccount - edge cases', () => {
    let mockReq;
    const pendingAccountId = 123;

    beforeEach(() => {
      mockReq = { session: { user_email: 'admin@example.com' } };
      jest.clearAllMocks();
    });

    it('should skip user creation when userExists === 1', async () => {
      UserManager.isProManager.mockReturnValue(true);
      UserManager.getTitles.mockReturnValue([{ id: 1, title: 'Manager' }]);
      UserManager.getCommodities.mockReturnValue([]);
      UserManager.getGeographies.mockReturnValue([]);
      AccountManager.getClassifications.mockReturnValue([]);
      speakEasy.createSecret.mockReturnValue('secret');
      PolicyManager.movePolicy.mockResolvedValue(undefined);
      awsSes.sendEmail.mockResolvedValue(true);
      sqlUtils.executeSystemQuery.mockResolvedValue(undefined);

      sqlUtils.executeSystemStoredProcedure.mockImplementation((req, spName) => {
        switch (spName) {
          case 'uspGetAllAccountsList':
            return Promise.resolve([
              {
                organization_id: pendingAccountId,
                organization_name: 'TestOrg',
                organization_status_id: orgAccountStatus.Pending,
              },
            ]);
          case 'uspGetPendingAccountInformation':
            return Promise.resolve([
              {
                id: 1,
                title_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '123',
                organization_name: 'TestOrg',
                organization_is_subsidiary: false,
              },
            ]);
          case 'uspActivatePendingAccount':
            return Promise.resolve([
              { ManagerEmail: 'john@example.com', UserExists: 1, orgID: 777 },
            ]);
          default:
            return Promise.resolve([]);
        }
      });

      await activatePendingAccount(mockReq, pendingAccountId, true);

      // Verify createUser was NOT called since UserExists === 1
      expect(awsCognito.createUser).not.toHaveBeenCalled();
    });

    it('should rollback on PolicyManager.movePolicy failure', async () => {
      UserManager.isProManager.mockReturnValue(true);
      UserManager.getTitles.mockReturnValue([{ id: 1, title: 'Manager' }]);
      UserManager.getCommodities.mockReturnValue([]);
      UserManager.getGeographies.mockReturnValue([]);
      AccountManager.getClassifications.mockReturnValue([]);
      speakEasy.createSecret.mockReturnValue('secret');
      sqlUtils.executeSystemQuery.mockResolvedValue(undefined);

      const movePolicyError = new Error('S3 copy failed');
      PolicyManager.movePolicy.mockRejectedValue(movePolicyError);

      const rollbackUtils = require('../privateutils/rollback.utils');
      rollbackUtils.dropDatabase = jest.fn();
      rollbackUtils.deleteSystemTableRow = jest.fn();

      sqlUtils.executeSystemStoredProcedure.mockImplementation((req, spName) => {
        switch (spName) {
          case 'uspGetAllAccountsList':
            return Promise.resolve([
              {
                organization_id: pendingAccountId,
                organization_name: 'TestOrg',
                organization_status_id: orgAccountStatus.Pending,
              },
            ]);
          case 'uspGetPendingAccountInformation':
            return Promise.resolve([
              {
                id: 1,
                title_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '123',
                organization_name: 'TestOrg',
                organization_is_subsidiary: false,
              },
            ]);
          case 'uspActivatePendingAccount':
            return Promise.resolve([
              { ManagerEmail: 'john@example.com', UserExists: 0, orgID: 888 },
            ]);
          default:
            return Promise.resolve([]);
        }
      });

      errorUtils.createErrorMessage.mockReturnValue({ error: 'Activation failed' });

      await expect(activatePendingAccount(mockReq, pendingAccountId, true)).rejects.toEqual({
        error: 'Activation failed',
      });

      // Verify rollback was called
      expect(rollbackUtils.dropDatabase).toHaveBeenCalledWith(mockReq, pendingAccountId);
      expect(rollbackUtils.deleteSystemTableRow).toHaveBeenCalledWith(
        mockReq,
        'Organizations',
        888,
        'id'
      );
    });

    it('should handle setOrganizationRenewalTime failure', async () => {
      UserManager.isProManager.mockReturnValue(true);
      UserManager.getTitles.mockReturnValue([{ id: 1, title: 'Manager' }]);
      UserManager.getCommodities.mockReturnValue([]);
      UserManager.getGeographies.mockReturnValue([]);
      AccountManager.getClassifications.mockReturnValue([]);
      speakEasy.createSecret.mockReturnValue('secret');

      const renewalError = new Error('Renewal time update failed');
      sqlUtils.executeSystemQuery.mockRejectedValue(renewalError);

      sqlUtils.executeSystemStoredProcedure.mockImplementation((req, spName) => {
        switch (spName) {
          case 'uspGetAllAccountsList':
            return Promise.resolve([
              {
                organization_id: pendingAccountId,
                organization_name: 'TestOrg',
                organization_status_id: orgAccountStatus.Pending,
              },
            ]);
          case 'uspGetPendingAccountInformation':
            return Promise.resolve([
              {
                id: 1,
                title_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '123',
                organization_name: 'TestOrg',
                organization_is_subsidiary: false,
              },
            ]);
          case 'uspActivatePendingAccount':
            return Promise.resolve([
              { ManagerEmail: 'john@example.com', UserExists: 0, orgID: 999 },
            ]);
          default:
            return Promise.resolve([]);
        }
      });

      errorUtils.createErrorMessage.mockReturnValue({ error: 'Renewal failed' });

      await expect(activatePendingAccount(mockReq, pendingAccountId, true)).rejects.toEqual({
        error: 'Renewal failed',
      });
    });

    it('should handle title_id === 10 (other title)', async () => {
      UserManager.isProManager.mockReturnValue(true);
      UserManager.getTitles.mockReturnValue([{ id: 1, title: 'Manager' }]);
      UserManager.getCommodities.mockReturnValue([]);
      UserManager.getGeographies.mockReturnValue([]);
      AccountManager.getClassifications.mockReturnValue([]);
      speakEasy.createSecret.mockReturnValue('secret');
      PolicyManager.movePolicy.mockResolvedValue(undefined);
      awsCognito.createUser.mockResolvedValue(undefined);
      awsSes.sendEmail.mockResolvedValue(true);
      sqlUtils.executeSystemQuery.mockResolvedValue(undefined);

      sqlUtils.executeSystemStoredProcedure.mockImplementation((req, spName) => {
        switch (spName) {
          case 'uspGetAllAccountsList':
            return Promise.resolve([
              {
                organization_id: pendingAccountId,
                organization_name: 'TestOrg',
                organization_status_id: orgAccountStatus.Pending,
              },
            ]);
          case 'uspGetPendingAccountInformation':
            return Promise.resolve([
              {
                id: 1,
                title_id: 10, // Other title
                other_title: 'Custom Title',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '123',
                organization_name: 'TestOrg',
                organization_is_subsidiary: false,
              },
            ]);
          case 'uspActivatePendingAccount':
            return Promise.resolve([
              { ManagerEmail: 'john@example.com', UserExists: 0, orgID: 555 },
            ]);
          default:
            return Promise.resolve([]);
        }
      });

      await expect(activatePendingAccount(mockReq, pendingAccountId, true)).resolves.toBe(true);
    });
  });

  describe('deactivateAccount - validation', () => {
    const mockReq = { session: { user_email: 'admin@example.com' } };
    const organizationId = 123;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should reject when organization not found', async () => {
      const { getOrganizationStatus } = require('./authenticationManager.utils');
      getOrganizationStatus.mockResolvedValue(null);

      await expect(deactivateAccount(mockReq, organizationId)).rejects.toMatchObject({
        code: errorUtils.ERROR_CODES.failedToDeactivateAccount,
        userMessage: 'Failed to deactivate account',
        systemMessage: expect.objectContaining({
          userMessage: 'Organization not found',
        }),
      });
    });

    it('should reject when trying to deactivate Pending account', async () => {
      const { getOrganizationStatus } = require('./authenticationManager.utils');
      getOrganizationStatus.mockResolvedValue(orgAccountStatus.Pending);

      await expect(deactivateAccount(mockReq, organizationId)).rejects.toMatchObject({
        code: errorUtils.ERROR_CODES.failedToDeactivateAccount,
        userMessage: 'Failed to deactivate account',
        systemMessage: expect.objectContaining({
          userMessage: 'Only active accounts can be deactivated',
        }),
      });
    });

    it('should reject when trying to deactivate Inactive account', async () => {
      const { getOrganizationStatus } = require('./authenticationManager.utils');
      getOrganizationStatus.mockResolvedValue(orgAccountStatus.Inactive);

      await expect(deactivateAccount(mockReq, organizationId)).rejects.toMatchObject({
        code: errorUtils.ERROR_CODES.failedToDeactivateAccount,
        userMessage: 'Failed to deactivate account',
        systemMessage: expect.objectContaining({
          userMessage: 'Only active accounts can be deactivated',
        }),
      });
    });
  });

  describe('getAccountSubscriptionStatus - error handling', () => {
    const mockReq = { session: { user_email: 'test@example.com' } };
    const organizationId = 123;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should reject when database call fails', async () => {
      const dbError = new Error('Connection lost');
      sqlUtils.executeSystemStoredProcedure.mockRejectedValue(dbError);
      errorUtils.createErrorMessage.mockReturnValue({ error: 'Failed to get status' });

      await expect(getAccountSubscriptionStatus(mockReq, organizationId)).rejects.toEqual({
        error: 'Failed to get status',
      });

      expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
        mockReq,
        errorUtils.ERROR_CODES.failedToGetAccountSubscriptionStatus,
        'Failed to retrieve account subscription status',
        dbError
      );
    });
  });
});

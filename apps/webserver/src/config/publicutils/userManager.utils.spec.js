/**
 * @jest-environment node
 */

jest.mock('../config', () => ({
  __esModule: true,
  default: {
    platformVars: {
      accessLevel: {
        Administrator: 1,
      },
      emailType: {
        INVITATION: 'INVITATION',
      },
    },
    AWSVars: {
      ses: {
        sender: 'noreply@example.com',
      },
    },
  },
}));

jest.mock('../langResources', () => ({
  getResourceString: jest.fn(),
}));

jest.mock('../privateutils/sql.utils', () => ({
  executeOrganizationQuery: jest.fn(),
  executeOrganizationStoredProcedure: jest.fn(),
  executeSystemStoredProcedure: jest.fn(),
}));

jest.mock('../privateutils/cognito.utils', () => ({
  userExists: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock('../privateutils/ses.utils', () => ({
  createBodyContent: jest.fn(),
  sendEmail: jest.fn(),
}));

jest.mock('../privateutils/speakeasy.utils', () => ({
  createSecret: jest.fn(),
}));

jest.mock('../privateutils/logger.utils', () => ({
  listActivityTypes: {
    User: {
      UserActivated: 101,
    },
  },
  logActivity: jest.fn(),
}));

jest.mock('../privateutils/error.utils', () => ({
  ERROR_CODES: {
    userNotAdmin: 403,
    failedToActivateUser: 404,
  },
  createErrorMessage: jest.fn(),
}));

const sqlUtils = require('../privateutils/sql.utils');
const awsCognito = require('../privateutils/cognito.utils');
const awsSes = require('../privateutils/ses.utils');
const speakEasy = require('../privateutils/speakeasy.utils');
const logger = require('../privateutils/logger.utils');
const errorUtils = require('../privateutils/error.utils');
const langResources = require('../langResources');
const { activateUser } = require('./userManager.utils');

describe('userManager.utils activateUser', () => {
  const req = {
    session: {
      user_access_level_id: 1,
      organization_id: 12,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    speakEasy.createSecret.mockReturnValue('secret-123');
    sqlUtils.executeOrganizationQuery.mockResolvedValue([]);
    sqlUtils.executeOrganizationStoredProcedure.mockResolvedValue([]);
    sqlUtils.executeSystemStoredProcedure
      .mockResolvedValueOnce([{ organization_name: 'Test Org' }])
      .mockResolvedValueOnce([]);
    awsSes.createBodyContent.mockReturnValue('email-body');
    awsSes.sendEmail.mockResolvedValue(true);
    awsCognito.userExists.mockResolvedValue(true);
    awsCognito.createUser.mockResolvedValue(true);
  });

  it('should activate user, clear deactivation date, and send invitation email when user exists', async () => {
    const result = await activateUser(req, 99, 'user@example.com', 'Ana', 'User');

    expect(result).toBe(true);
    expect(sqlUtils.executeOrganizationQuery).toHaveBeenCalledWith(
      req,
      expect.anything(),
      expect.arrayContaining([
        expect.objectContaining({ field: 'userID', value: 99 }),
        expect.objectContaining({ field: 'statusID' }),
        expect.objectContaining({ field: 'activatedTime' }),
        expect.objectContaining({ field: 'deactivationDate', value: null }),
      ])
    );
    expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
      req,
      'uspSetUserRouteStatus',
      expect.any(Array)
    );
    expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
      req,
      'uspActivateUser',
      expect.arrayContaining([
        expect.objectContaining({ field: 'UserSecret', value: 'secret-123' }),
        expect.objectContaining({ field: 'UserEmail', value: 'user@example.com' }),
      ])
    );
    expect(awsSes.sendEmail).toHaveBeenCalledWith(
      req,
      'noreply@example.com',
      ['user@example.com'],
      'Welcome to Global Forest Watch Pro!',
      'email-body'
    );
    expect(awsCognito.createUser).not.toHaveBeenCalled();
    expect(logger.logActivity).toHaveBeenCalled();
  });

  it('should create Cognito user when account does not exist in Cognito', async () => {
    awsCognito.userExists.mockResolvedValue(false);

    const result = await activateUser(req, 88, 'newuser@example.com', 'New', 'Person', true);

    expect(result).toBe(true);
    expect(awsCognito.createUser).toHaveBeenCalledWith(req, 'newuser@example.com', false, true);
    expect(awsSes.sendEmail).not.toHaveBeenCalled();
  });

  it('should map failures to failedToActivateUser error', async () => {
    const dbError = new Error('db failed');
    const mappedError = { errorCode: 404, userMessage: 'Failed to activate user' };
    sqlUtils.executeOrganizationQuery.mockRejectedValue(dbError);
    errorUtils.createErrorMessage.mockReturnValue(mappedError);

    await expect(activateUser(req, 77, 'broken@example.com', 'Broken', 'Flow')).rejects.toBe(
      mappedError
    );
    expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
      req,
      errorUtils.ERROR_CODES.failedToActivateUser,
      'Failed to activate user',
      dbError
    );
  });

  it('should reject when caller is not an administrator', async () => {
    const nonAdminReq = {
      session: {
        user_access_level_id: 2,
        organization_id: 12,
      },
    };
    const mappedError = { errorCode: 403, userMessage: 'Not admin' };
    langResources.getResourceString.mockReturnValue('Not admin');
    errorUtils.createErrorMessage.mockReturnValue(mappedError);

    await expect(activateUser(nonAdminReq, 1, 'x@example.com', 'No', 'Admin')).rejects.toBe(
      mappedError
    );
    expect(sqlUtils.executeOrganizationQuery).not.toHaveBeenCalled();
    expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
      nonAdminReq,
      errorUtils.ERROR_CODES.userNotAdmin,
      'Not admin',
      'Not admin'
    );
  });
});

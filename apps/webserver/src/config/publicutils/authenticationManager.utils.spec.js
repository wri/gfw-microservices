jest.mock('mssql', () => {
  const createTypeMock = (typeName) => jest.fn(() => typeName);
  const baseTypes = {
    NVarChar: createTypeMock('NVarChar'),
    VarChar: createTypeMock('VarChar'),
    DateTime: createTypeMock('DateTime'),
    Int: createTypeMock('Int'),
    Bit: createTypeMock('Bit'),
    Float: createTypeMock('Float'),
  };

  return new Proxy(baseTypes, {
    get(target, prop) {
      if (!target[prop]) {
        target[prop] = createTypeMock(prop);
      }
      return target[prop];
    },
  });
});

jest.mock('../config', () => ({
  __esModule: true,
  default: {
    AWSVars: {
      cognito: {
        userpoolId: 'mock-userpool-id',
      },
      ses: {
        sender: 'no-reply@example.com',
      },
    },
    SQLConnection: {
      host: 'localhost',
      port: '1433',
      database: 'test-db',
      username: 'user',
      password: 'pass',
    },
    platformVars: {
      authenticationStatus: {
        Authenticated: 1,
        Unauthenticated: 2,
        RequireNewPassword: 3,
        ConfirmPassword: 4,
        Disabled: 5,
        ResetRequired: 6,
        ForceReset: 7,
        ResendPassword: 8,
      },
      authenticationPreference: {
        Email: 0,
        GoogleAuthenticator: 1,
      },
      emailType: {
        VERIFY_AUTHENTICATION: 'VERIFY_AUTHENTICATION',
      },
    },
    devTestUserAuthSecret: 'dev-secret',
  },
}));

jest.mock('../langResources', () => ({
  getResourceString: jest.fn().mockReturnValue('localized message'),
}));

jest.mock('../privateutils/cognito.utils', () => ({
  getUserInfo: jest.fn(),
  authenticateUser: jest.fn(),
  adminResetUserPassword: jest.fn(),
  resendTemporaryPassword: jest.fn(),
}));

jest.mock('../privateutils/error.utils', () => ({
  ERROR_CODES: {
    failedToAuthenticate: 109,
    userNotAdmin: 100,
    rateLimitExceeded: 999,
  },
  createErrorMessage: jest.fn((req, code, userMessage, systemMessage) => {
    const err = new Error(userMessage);
    err.errorCode = code;
    err.userMessage = userMessage;
    err.systemMessage = systemMessage;
    return err;
  }),
}));

jest.mock('../privateutils/logger.utils', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock('../privateutils/ses.utils', () => ({
  createBodyContent: jest.fn().mockReturnValue('body-content'),
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../privateutils/speakeasy.utils', () => ({
  createTotp: jest.fn().mockResolvedValue('123456'),
}));

jest.mock('../privateutils/sql.utils', () => ({
  executeSystemStoredProcedure: jest.fn(),
  executeOrganizationStoredProcedure: jest.fn(),
  executeStoredProcedure: jest.fn(),
  executeStoredProcedureWithParams: jest.fn(),
  queryDBFirstRow: jest.fn(),
}));

jest.mock('../env/orgAccountStatus.constants', () => ({
  orgAccountStatus: {
    Inactive: -1,
  },
}));

const { login } = require('./authenticationManager.utils');
const awsCognito = require('../privateutils/cognito.utils');
const errorUtils = require('../privateutils/error.utils');
const awsSes = require('../privateutils/ses.utils');
const speakEasy = require('../privateutils/speakeasy.utils');
const sqlUtils = require('../privateutils/sql.utils');

const buildAuthResponse = (passwordUpdatedAt) => ({
  authenticationStatus: 1, // Authenticated
  email: 'user@example.com',
  token: 'token-123',
  'custom:passwordUpdatedAt': passwordUpdatedAt,
});

const mockInitialUserRouteInfo = {
  id: 42,
  user_email: 'user@example.com',
  user_secret: 'secret-value',
  user_auth_preference_id: 0, // Email preference
};

const mockVerifiedRouteInfo = {
  organization_status_id: 1,
};

describe('authenticationManager.utils - password expiration', () => {
  const NOW = new Date('2025-03-31T12:00:00Z');

  const configureHappyPath = (authResponse) => {
    awsCognito.getUserInfo.mockResolvedValue({ Username: 'user@example.com' });
    awsCognito.authenticateUser.mockResolvedValue(authResponse);
    awsCognito.adminResetUserPassword.mockResolvedValue(undefined);
    // Re-throw the error that was passed to resendTemporaryPassword
    awsCognito.resendTemporaryPassword.mockImplementation(async (req, username, err) => {
      throw err;
    });

    sqlUtils.executeSystemStoredProcedure.mockImplementation(async (req, storedProcedure) => {
      if (storedProcedure === 'uspGetInitialUserRouteInfo') {
        return [mockInitialUserRouteInfo];
      }
      if (storedProcedure === 'uspGetVerifiedUserRouteInfo') {
        return [mockVerifiedRouteInfo];
      }
      return [];
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('expires the password when last update is older than 90 days', async () => {
    const ninetyOneDaysAgo = new Date(NOW);
    ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);

    const authResponse = buildAuthResponse(ninetyOneDaysAgo.toISOString());
    configureHappyPath(authResponse);

    const req = { session: {} };

    await expect(login(req, 'USER@Example.com', 'password123')).rejects.toThrow('PasswordExpired');

    expect(awsCognito.adminResetUserPassword).toHaveBeenCalledWith(req, 'user@example.com');
    expect(errorUtils.createErrorMessage).toHaveBeenCalledWith(
      req,
      errorUtils.ERROR_CODES.failedToAuthenticate,
      'PasswordExpired',
      expect.stringContaining('Password expired')
    );
  });

  it('expires the password when it is exactly 90 days old', async () => {
    const ninetyDaysAgo = new Date(NOW);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const authResponse = buildAuthResponse(ninetyDaysAgo.toISOString());
    configureHappyPath(authResponse);

    const req = { session: {} };

    await expect(login(req, 'user@example.com', 'password123')).rejects.toThrow('PasswordExpired');

    expect(awsCognito.adminResetUserPassword).toHaveBeenCalledWith(req, 'user@example.com');
  });

  it('allows login when password was updated 89 days ago', async () => {
    const eightyNineDaysAgo = new Date(NOW);
    eightyNineDaysAgo.setDate(eightyNineDaysAgo.getDate() - 89);

    const authResponse = buildAuthResponse(eightyNineDaysAgo.toISOString());
    configureHappyPath(authResponse);

    const req = { session: {} };

    const result = await login(req, 'user@example.com', 'password123');

    expect(result).toEqual(authResponse);
    expect(awsCognito.adminResetUserPassword).not.toHaveBeenCalled();
    expect(sqlUtils.executeSystemStoredProcedure).toHaveBeenCalledWith(
      req,
      'uspGetInitialUserRouteInfo',
      expect.any(Array)
    );
    expect(speakEasy.createTotp).toHaveBeenCalled();
    expect(awsSes.sendEmail).toHaveBeenCalledWith(
      req,
      'no-reply@example.com',
      ['user@example.com'],
      'GFW Pro Verification Code',
      'body-content'
    );
    expect(req.session).toMatchObject({
      user_email: 'user@example.com',
      access_token: 'token-123',
      last_activity_time: expect.any(Date),
    });
  });
});

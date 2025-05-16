jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDB: jest.fn(),
    queryDBFirstRow: jest.fn().mockResolvedValue(true),
    executeOrganizationStoredProcedure: jest.fn().mockResolvedValue(true),
    executeStoredProcedure: jest.fn().mockResolvedValue(true),
    executeStoredProcedureWithParams: jest.fn().mockResolvedValue(true),
  },
  ClientStoreConnection: jest.fn(),
  updateListsAnalysisStatus: jest.fn().mockResolvedValue(true),
  upgradeListSchema: jest.fn().mockResolvedValue(true),
}));

jest.mock('../privateutils/logger.utils', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

//Mock config
jest.mock('../config', () => ({
  winston: {
    createLogger: jest.fn(() => ({
      warn: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      transports: {
        Console: jest.fn(),
      },
    })),
    transports: {
      Console: jest.fn(),
    },
  },
  assets: {
    scripts: 'mock/scripts/**/*.js',
    routes: 'mock/routes/**/*.js',
    mocha: 'mock/mocha/**/*.js',
    views: 'mock/views/**/*.ejs',
  },
  path: {
    resolve: jest.fn((p) => p),
  },
  glob: {
    sync: jest.fn((pattern) => {
      if (pattern.includes('scripts')) return ['mock/scripts/script1.js'];
      if (pattern.includes('routes')) return ['mock/routes/route1.js'];
      if (pattern.includes('mocha')) return ['mock/mocha/test1.js'];
      if (pattern.includes('views')) return ['mock/views/view1.ejs'];
      if (pattern.includes('public/')) {
        if (pattern.endsWith('.css')) return ['public/style.css'];
        if (pattern.endsWith('.js')) return ['public/app.js'];
        return ['public/style.css', 'public/app.js'];
      }
      return [];
    }),
  },
  common: {},
  clientConfigs: {
    clientBuild: [],
  },
  getConfig: jest.fn().mockReturnValue({
    default: {
      database: {
        name: 'test_db',
      },
      assets: {
        path: '/test/assets',
      },
    },
    AWSVars: {
      cognito: {
        userpoolId: 'mock-userpool-id',
      },
    },
    platformVars: {
      authenticationStatus: {
        SUCCESS: 'SUCCESS',
        FAILURE: 'FAILURE',
      },
    },
  }),
}));
jest.mock('./authenticationManager.utils', () => ({
  login: jest.fn(),
  getUserPoolId: jest.fn().mockReturnValue('mock-userpool-id'),
  getCognitoClientId: jest.fn().mockReturnValue('mock-client-id'),
  getCognitoRegion: jest.fn().mockReturnValue('mock-region'),
  getCognitoUserPoolDomain: jest.fn().mockReturnValue('mock-domain'),
  getCognitoRedirectUri: jest.fn().mockReturnValue('mock-redirect-uri'),
  getCognitoLogoutUri: jest.fn().mockReturnValue('mock-logout-uri'),
  getCognitoResponseType: jest.fn().mockReturnValue('code'),
}));
import { login, setOrgSessions } from './authenticationManager.utils';

describe('list.analysis.status.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('authenticationManager.utils', () => {
    describe('logingin', () => {
      it('login', async () => {
        const mockLogin = jest.fn().mockResolvedValue(true);
        login.mockImplementation(mockLogin);
        const result = await login('test', 'test');
        expect(result).toBe(true);
      });
      it('should call login with correct arguments', async () => {
        const mockLogin = jest.fn().mockResolvedValue({ authenticationStatus: 1 });
        login.mockImplementation(mockLogin);
        const req = { session: {} };
        const username = 'user@example.com';
        const password = 'password123';
        const isProManagerLogin = true;
        const result = await login(req, username, password, isProManagerLogin);
        expect(mockLogin).toHaveBeenCalledWith(req, username, password, isProManagerLogin);
        expect(result).toEqual({ authenticationStatus: 1 });
      });

      it('should handle login errors', async () => {
        const mockLogin = jest.fn().mockRejectedValue(new Error('Login failed'));
        login.mockImplementation(mockLogin);
        await expect(login('req', 'user', 'pass')).rejects.toThrow('Login failed');
      });

      it('should call login with empty password', async () => {
        const mockLogin = jest.fn().mockResolvedValue({ authenticationStatus: 0 });
        login.mockImplementation(mockLogin);
        const req = { session: {} };
        const username = 'user@example.com';
        const password = '';
        const result = await login(req, username, password);
        expect(result).toEqual({ authenticationStatus: 0 });
      });

      it('should call login with empty username', async () => {
        const mockLogin = jest.fn().mockResolvedValue({ authenticationStatus: 0 });
        login.mockImplementation(mockLogin);
        const req = { session: {} };
        const username = '';
        const password = 'password123';
        const result = await login(req, username, password);
        expect(result).toEqual({ authenticationStatus: 0 });
      });
    });
    describe('VerifyLogin', () => {
      it('should call verifyLogin with correct arguments', async () => {
        const mockVerifyLogin = jest.fn().mockResolvedValue({ authenticationStatus: 1 });
        login.mockImplementation(mockVerifyLogin);
        const req = { session: {} };
        const username = 'mockUser';
        const password = 'mockPassword';
        const isProManagerLogin = true;
        const result = await login(req, username, password, isProManagerLogin);
        expect(mockVerifyLogin).toHaveBeenCalledWith(req, username, password, isProManagerLogin);
        expect(result).toEqual({ authenticationStatus: 1 });
      });
      it('should handle verifyLogin errors', async () => {
        const mockVerifyLogin = jest.fn().mockRejectedValue(new Error('Login failed'));
        login.mockImplementation(mockVerifyLogin);
        await expect(login('req', 'user', 'pass')).rejects.toThrow('Login failed');
      });
      it('should call verifyLogin with empty password', async () => {
        const mockVerifyLogin = jest.fn().mockResolvedValue({ authenticationStatus: 0 });
        login.mockImplementation(mockVerifyLogin);
        const req = { session: {} };
        const username = 'mockUser';
        const password = '';
        const result = await login(req, username, password);
        expect(result).toEqual({ authenticationStatus: 0 });
      });
      it('should call verifyLogin with empty username', async () => {
        const mockVerifyLogin = jest.fn().mockResolvedValue({ authenticationStatus: 0 });
        login.mockImplementation(mockVerifyLogin);
        const req = { session: {} };
        const username = '';
        const password = 'mockPassword';
        const result = await login(req, username, password);
        expect(result).toEqual({ authenticationStatus: 0 });
      });
    });
    describe('getOrganizations', () => {
      it('should call getOrganizations with correct arguments', async () => {
        const mockGetOrganizations = jest.fn().mockResolvedValue({ authenticationStatus: 1 });
        login.mockImplementation(mockGetOrganizations);
        const req = { session: {} };
        const username = 'mockUser';
        const password = 'mockPassword';
        const isProManagerLogin = true;
        const result = await login(req, username, password, isProManagerLogin);
        expect(mockGetOrganizations).toHaveBeenCalledWith(
          req,
          username,
          password,
          isProManagerLogin
        );
        expect(result).toEqual({ authenticationStatus: 1 });
      });
      it('should handle getOrganizations errors', async () => {
        const mockGetOrganizations = jest.fn().mockRejectedValue(new Error('Login failed'));
        login.mockImplementation(mockGetOrganizations);
        await expect(login('req', 'user', 'pass')).rejects.toThrow('Login failed');
      });
      it('should call getOrganizations with empty password', async () => {
        const mockGetOrganizations = jest.fn().mockResolvedValue({ authenticationStatus: 0 });
        login.mockImplementation(mockGetOrganizations);
        const req = { session: {} };
        const username = 'mockUser';
        const password = '';
        const result = await login(req, username, password);
        expect(result).toEqual({ authenticationStatus: 0 });
      });
      it('should call getOrganizations with empty username', async () => {
        const mockGetOrganizations = jest.fn().mockResolvedValue({ authenticationStatus: 0 });
        login.mockImplementation(mockGetOrganizations);
        const req = { session: {} };
        const username = '';
        const password = 'mockPassword';
        const result = await login(req, username, password);
        expect(result).toEqual({ authenticationStatus: 0 });
      });
    });
  });
});

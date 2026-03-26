const { subHours } = require('date-fns');

jest.mock('path', () => ({
  resolve: (p) => p,
}));

const mockLogger = {
  logActivity: jest.fn(),
  error: jest.fn(),
  listActivityTypes: { User: { UserLogout: 'UserLogout' } },
};

jest.mock('./config/privateutils/logger.utils', () => mockLogger, { virtual: true });

const mockAuthManager = {
  getUserOrganizationStatus: jest.fn(),
  getOrganizationStatus: jest.fn(),
};

jest.mock('./config/publicutils/authenticationManager.utils', () => mockAuthManager, {
  virtual: true,
});

jest.mock(
  './config/env/listStatuses.constants',
  () => ({
    listStatus: { Pending: 1, Active: 2, Inactive: 3 },
  }),
  { virtual: true }
);

jest.mock(
  './config/config',
  () => ({
    default: {
      platformVars: {
        accessLevel: { Administrator: 1, Editor: 2, Viewer: 3 },
      },
    },
  }),
  { virtual: true }
);

const {
  checkActive,
  checkAdministrator,
  checkAuthentication,
  checkInactivity,
  checkOrganization,
  checkProManagerAuthentication,
  checkRecognized,
  rateLimitAuthenticated,
  rateLimitUnauthenticated,
} = require('./middlewares');

describe('middlewares', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      method: 'GET',
      baseUrl: '/dashboard',
      session: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('checkActive', () => {
    it('should call next when user status is Active', async () => {
      mockAuthManager.getUserOrganizationStatus.mockResolvedValue(2);

      checkActive(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockNext).toHaveBeenCalled();
    });

    it('should redirect on GET when user is not active', async () => {
      mockAuthManager.getUserOrganizationStatus.mockResolvedValue(3);

      checkActive(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockRes.redirect).toHaveBeenCalledWith('/');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 JSON on POST when user is not active', async () => {
      mockReq.method = 'POST';
      mockAuthManager.getUserOrganizationStatus.mockResolvedValue(3);

      checkActive(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ redirect: '/' });
    });

    it('should redirect on GET when getUserOrganizationStatus rejects', async () => {
      mockAuthManager.getUserOrganizationStatus.mockRejectedValue(new Error('fail'));

      checkActive(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });

    it('should return 401 JSON on POST when getUserOrganizationStatus rejects', async () => {
      mockReq.method = 'POST';
      mockAuthManager.getUserOrganizationStatus.mockRejectedValue(new Error('fail'));

      checkActive(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ redirect: '/' });
    });
  });

  describe('checkAuthentication', () => {
    it('should call next when organization_id is defined', () => {
      mockReq.session.organization_id = 123;

      checkAuthentication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should redirect when organization_id is undefined', () => {
      checkAuthentication(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('/');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkInactivity', () => {
    it('should call next and not update last_activity_time for /session baseUrl', () => {
      mockReq.baseUrl = '/session';
      mockReq.session.last_activity_time = new Date().toISOString();

      checkInactivity(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.session.last_activity_time).toEqual(expect.any(String));
    });

    it('should call next and update last_activity_time for non-session baseUrl', () => {
      mockReq.session.last_activity_time = new Date().toISOString();

      checkInactivity(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.session.last_activity_time).toEqual(expect.any(Date));
    });

    it('should redirect GET when session is inactive (promanager)', () => {
      mockReq.session.last_activity_time = subHours(new Date(), 5).toISOString();
      mockReq.session.ispromanager = true;
      mockReq.session.destroy = jest.fn();

      checkInactivity(mockReq, mockRes, mockNext);

      expect(mockReq.session.destroy).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });

    it('should return 401 JSON on POST when session is inactive (promanager)', () => {
      mockReq.method = 'POST';
      mockReq.session.last_activity_time = subHours(new Date(), 5).toISOString();
      mockReq.session.ispromanager = true;
      mockReq.session.destroy = jest.fn();

      checkInactivity(mockReq, mockRes, mockNext);

      expect(mockReq.session.destroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ redirect: '/' });
    });

    it('should log activity and destroy session for non-promanager with organization_database', async () => {
      mockReq.session.last_activity_time = subHours(new Date(), 5).toISOString();
      mockReq.session.ispromanager = false;
      mockReq.session.organization_database = 'test_db';
      mockReq.session.organization_user_id = 42;
      mockReq.session.destroy = jest.fn();
      mockLogger.logActivity.mockResolvedValue();

      checkInactivity(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockLogger.logActivity).toHaveBeenCalledWith(
        mockReq,
        'UserLogout',
        'User ID 42 has logged out due to inactivity.'
      );
      expect(mockReq.session.destroy).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });

    it('should destroy session without logging for non-promanager without organization_database', () => {
      mockReq.session.last_activity_time = subHours(new Date(), 5).toISOString();
      mockReq.session.ispromanager = false;
      mockReq.session.organization_database = '';
      mockReq.session.destroy = jest.fn();

      checkInactivity(mockReq, mockRes, mockNext);

      expect(mockReq.session.destroy).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith('/');
      expect(mockLogger.logActivity).not.toHaveBeenCalled();
    });

    it('should redirect when /session baseUrl and no last_activity_time (expired session)', () => {
      mockReq.baseUrl = '/session';
      // last_activity_time is undefined

      checkInactivity(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('/');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkOrganization', () => {
    it('should call next when organization status is Active', async () => {
      mockAuthManager.getOrganizationStatus.mockResolvedValue(2);

      checkOrganization(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockNext).toHaveBeenCalled();
    });

    it('should redirect on GET when organization is not active', async () => {
      mockAuthManager.getOrganizationStatus.mockResolvedValue(3);

      checkOrganization(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });

    it('should return 401 JSON on POST when organization is not active', async () => {
      mockReq.method = 'POST';
      mockAuthManager.getOrganizationStatus.mockResolvedValue(3);

      checkOrganization(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ redirect: '/' });
    });

    it('should redirect on GET when getOrganizationStatus rejects', async () => {
      mockAuthManager.getOrganizationStatus.mockRejectedValue(new Error('fail'));

      checkOrganization(mockReq, mockRes, mockNext);
      await flushPromises();

      expect(mockRes.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('checkProManagerAuthentication', () => {
    it('should call next when verified_promanager is truthy', () => {
      mockReq.session.verified_promanager = true;

      checkProManagerAuthentication(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should redirect to /pro-manager when not verified', () => {
      mockReq.session.verified_promanager = false;

      checkProManagerAuthentication(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('/pro-manager');
    });
  });

  describe('checkAdministrator', () => {
    it('should call next when user is an Administrator', () => {
      mockReq.session.user_access_level_id = 1;

      checkAdministrator(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 when user is not an Administrator', () => {
      mockReq.session.user_access_level_id = 2;

      checkAdministrator(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Forbidden: Administrator access required',
        redirect: '/',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('checkRecognized', () => {
    it('should call next when user_email is defined', () => {
      mockReq.session.user_email = 'test@example.com';

      checkRecognized(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should redirect when user_email is undefined', () => {
      checkRecognized(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith('/');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('rate limit configs', () => {
    it('should have correct authenticated rate limit values', () => {
      expect(rateLimitAuthenticated).toEqual({
        windowMs: 1000,
        max: 50,
      });
    });

    it('should have correct unauthenticated rate limit values', () => {
      expect(rateLimitUnauthenticated).toEqual({
        windowMs: 20000,
        max: 20,
      });
    });
  });
});

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

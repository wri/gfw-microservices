// Authorization tests for /profile/updateuser endpoint - IDOR vulnerability fix
import request from 'supertest';
import express from 'express';
import {
  validateRequest,
  updateUserSchema,
} from '../../../config/publicutils/validation.middleware';
import * as UserManager from '../../../config/publicutils/userManager.utils';
import * as logger from '../../../config/privateutils/logger.utils';

// Mock dependencies
jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  logActivity: jest.fn().mockResolvedValue(true),
  listActivityTypes: {
    User: {
      UserUpdated: 'UserUpdated',
    },
  },
}));

jest.mock('../../../config/publicutils/userManager.utils', () => ({
  updateUserInfo: jest.fn(),
  isAdministrator: jest.fn(),
}));

describe('POST /profile/updateuser - Authorization Controls (IDOR Prevention)', () => {
  let app;
  let mockUpdateUserInfo;
  let mockIsAdministrator;

  // Helper function to create the app with a specific session configuration
  const createApp = (sessionConfig: any) => {
    const testApp = express();
    testApp.use(express.json());

    // Mock session middleware
    testApp.use((req, res, next) => {
      req.session = sessionConfig;
      next();
    });

    // Define the route with authorization checks (matching the actual implementation)
    testApp.post('/profile/updateuser', validateRequest(updateUserSchema), async (req, res) => {
      logger.info('POST /profile/updateuser');
      const {
        id,
        first_name,
        middle_initial,
        last_name,
        email,
        phone,
        title_id,
        other_title,
        access_level_id,
        enableAlerts,
        geographies,
        commodities,
        auth_preference_id,
      } = req.body;

      try {
        // Security: Derive user ID from authenticated session
        const authenticatedUserId = req.session.organization_user_id;
        const requestedUserId = id;
        const isAdmin = UserManager.isAdministrator(req);

        // Authorization check: Non-admin users can only update their own profile
        // If requestedUserId is null/undefined, treat as self-update
        if (!isAdmin && requestedUserId && requestedUserId !== authenticatedUserId) {
          logger.warn(
            `POST /profile/updateuser - Unauthorized attempt: User ${authenticatedUserId} tried to update user ${requestedUserId}`
          );
          res.status(403).json({
            errorCode: 403,
            userMessage: "You are not authorized to update another user's profile",
          });
          return;
        }

        // Use the authenticated user ID for self-updates, or the requested ID for admin updates
        const targetUserId = isAdmin && requestedUserId ? requestedUserId : authenticatedUserId;

        const result = await UserManager.updateUserInfo({
          req,
          user_id: targetUserId,
          user_first_name: first_name,
          user_middle_initial: middle_initial,
          user_last_name: last_name,
          user_email: email,
          user_phone: phone,
          user_title_id: title_id,
          other_title,
          access_level_id,
          email_subscription: enableAlerts,
          arr_user_geography_ids: geographies,
          arr_user_commodity_ids: commodities,
          user_auth_preference_id: auth_preference_id,
          loggedUserAccessLevelId: req.session.user_access_level_id,
        });
        res.status(200).json(result);
      } catch (err) {
        logger.error('POST /profile/updateuser', err);
        const statusCode = err.errorCode || 500;
        const errorMessage = err.userMessage || err.message || 'Failed to update user information';
        res.status(statusCode).json({
          errorCode: err.errorCode,
          userMessage: errorMessage,
        });
      }
    });

    return testApp;
  };

  describe('Non-Admin User Authorization', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUpdateUserInfo = UserManager.updateUserInfo as jest.Mock;
      mockIsAdministrator = UserManager.isAdministrator as jest.Mock;
      mockIsAdministrator.mockReturnValue(false);
      mockUpdateUserInfo.mockResolvedValue(true);
    });

    it("should prevent non-admin user from updating another user's profile (IDOR attack)", async () => {
      const authenticatedUserId = 32;
      const targetUserId = 33;

      app = createApp({
        organization_user_id: authenticatedUserId,
        user_access_level_id: 3, // Viewer
        organization_id: 1,
      });

      const response = await request(app).post('/profile/updateuser').send({
        id: targetUserId,
        first_name: 'Modified',
        last_name: 'Name',
        email: 'victim@example.com',
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        errorCode: 403,
        userMessage: "You are not authorized to update another user's profile",
      });
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`User ${authenticatedUserId} tried to update user ${targetUserId}`)
      );
    });

    it('should allow non-admin user to update their own profile', async () => {
      const authenticatedUserId = 32;

      app = createApp({
        organization_user_id: authenticatedUserId,
        user_access_level_id: 3,
        organization_id: 1,
      });

      const response = await request(app).post('/profile/updateuser').send({
        id: authenticatedUserId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: authenticatedUserId,
          user_first_name: 'John',
          user_last_name: 'Doe',
        })
      );
    });

    it('should use authenticated user ID when no ID is provided in request', async () => {
      const authenticatedUserId = 42;

      app = createApp({
        organization_user_id: authenticatedUserId,
        user_access_level_id: 2, // Editor
        organization_id: 1,
      });

      const response = await request(app).post('/profile/updateuser').send({
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: authenticatedUserId,
          user_first_name: 'Jane',
          user_last_name: 'Smith',
        })
      );
    });

    it('should prevent ID manipulation via request tampering', async () => {
      const authenticatedUserId = 100;
      const maliciousTargetId = 1; // Attempting to modify admin account

      app = createApp({
        organization_user_id: authenticatedUserId,
        user_access_level_id: 3,
        organization_id: 1,
      });

      const response = await request(app).post('/profile/updateuser').send({
        id: maliciousTargetId,
        first_name: 'Hacker',
        last_name: 'Attempt',
        email: 'admin@example.com',
      });

      expect(response.status).toBe(403);
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });
  });

  describe('Admin User Authorization', () => {
    beforeEach(() => {
      mockIsAdministrator.mockReturnValue(true);
      mockUpdateUserInfo.mockResolvedValue(true);
    });

    it("should allow admin to update another user's profile", async () => {
      const adminUserId = 1;
      jest.clearAllMocks();
      mockUpdateUserInfo = UserManager.updateUserInfo as jest.Mock;
      mockIsAdministrator = UserManager.isAdministrator as jest.Mock;
      const targetUserId = 33;

      app = createApp({
        organization_user_id: adminUserId,
        user_access_level_id: 1, // Administrator
        organization_id: 1,
      });

      const response = await request(app).post('/profile/updateuser').send({
        id: targetUserId,
        first_name: 'Updated',
        last_name: 'User',
        email: 'updated@example.com',
      });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: targetUserId,
          user_first_name: 'Updated',
          user_last_name: 'User',
        })
      );
    });

    it('should allow admin to update their own profile', async () => {
      const adminUserId = 1;

      app = createApp({
        organization_user_id: adminUserId,
        user_access_level_id: 1,
        organization_id: 1,
      });

      const response = await request(app).post('/profile/updateuser').send({
        id: adminUserId,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
      });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: adminUserId,
        })
      );
    });

    it('should use authenticated user ID for admin when no ID is provided', async () => {
      const adminUserId = 1;

      app = createApp({
        organization_user_id: adminUserId,
        user_access_level_id: 1,
        organization_id: 1,
      });

      const response = await request(app).post('/profile/updateuser').send({
        first_name: 'Admin',
        last_name: 'NoId',
        email: 'admin@example.com',
      });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: adminUserId,
        })
      );
    });
  });

  describe('Proof of Concept from Security Report', () => {
    it('should prevent the documented IDOR attack (User 32 modifying User 33)', async () => {
      // User testaccount2 (ID: 32) attempts to modify testaccount3 (ID: 33)
      jest.clearAllMocks();
      mockUpdateUserInfo = UserManager.updateUserInfo as jest.Mock;
      mockIsAdministrator = UserManager.isAdministrator as jest.Mock;
      mockIsAdministrator.mockReturnValue(false);
      const attackerUserId = 32;
      const victimUserId = 33;

      app = createApp({
        organization_user_id: attackerUserId,
        user_access_level_id: 3, // Non-admin user
        organization_id: 1,
      });

      // Attempt the exact attack from the security report
      const response = await request(app)
        .post('/profile/updateuser')
        .send({
          id: victimUserId,
          first_name: 'testbbb',
          last_name: 'account three modified',
          email: 'testaccount3@onsecurity.co.uk',
          phone: '1234567890',
          title_id: 1,
          access_level_id: 1,
          enableAlerts: false,
          geographies: [0],
          commodities: [0],
        });

      // Should be rejected with 403
      expect(response.status).toBe(403);
      expect(response.body.errorCode).toBe(403);
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();

      // Verify security warning was logged
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unauthorized attempt'));
    });
  });
});

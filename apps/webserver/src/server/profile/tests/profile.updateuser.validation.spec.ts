// Integration tests for /profile/updateuser endpoint validation
import request from 'supertest';
import express from 'express';
import {
  validateRequest,
  updateUserSchema,
} from '../../../config/publicutils/validation.middleware';
import * as UserManager from '../../../config/publicutils/userManager.utils';
import * as logger from '../../../config/privateutils/logger.utils';
import * as errorUtils from '../../../config/privateutils/error.utils';

// Mock dependencies
jest.mock('../../../config/privateutils/logger.utils', () => ({
  info: jest.fn(),
  error: jest.fn(),
  logActivity: jest.fn().mockResolvedValue(true),
  listActivityTypes: {
    User: {
      UserUpdated: 'UserUpdated',
    },
  },
}));

jest.mock('../../../config/privateutils/error.utils', () => ({
  ERROR_CODES: {
    unauthorizedUserModification: 411,
  },
  createErrorMessage: jest.fn((req, errorCode, userMsg, systemMsg) => ({
    errorCode,
    userMessage: userMsg,
    systemMessage: systemMsg,
  })),
}));

jest.mock('../../../config/publicutils/userManager.utils', () => ({
  updateUserInfo: jest.fn(),
  isAdministrator: jest.fn(),
}));

describe('POST /profile/updateuser - Input Validation', () => {
  let app;
  let mockUpdateUserInfo;
  let mockIsAdministrator;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a simple Express app for testing
    app = express();
    app.use(express.json({ limit: '50mb' })); // Set a high limit for testing our validation

    // Mock session middleware
    app.use((req, res, next) => {
      req.session = {
        organization_id: 1,
        organization_user_id: 1, // Set authenticated user ID
        user_access_level_id: 2,
        last_activity_time: new Date(),
      };
      next();
    });

    mockUpdateUserInfo = UserManager.updateUserInfo;
    mockIsAdministrator = UserManager.isAdministrator as jest.Mock;
    // Default to non-admin for validation tests
    mockIsAdministrator.mockReturnValue(false);

    // Define the route
    app.post('/profile/updateuser', validateRequest(updateUserSchema), async (req, res) => {
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
        marketing_email_opt_out,
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
          const errorResponse = errorUtils.createErrorMessage(
            req,
            errorUtils.ERROR_CODES.unauthorizedUserModification,
            "You are not authorized to update another user's profile",
            `User ${authenticatedUserId} attempted to modify user ${requestedUserId}`
          );
          res.status(403).json({
            errorCode: errorResponse.errorCode,
            userMessage: errorResponse.userMessage,
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
          marketing_email_opt_out,
          loggedUserAccessLevelId: req.session.user_access_level_id,
        });
        res.status(200).json(result);
      } catch (err) {
        logger.error('POST /profile/updateuser', err);
        // Always use HTTP 500 for server errors; errorCode in body is for internal tracking
        const errorMessage = err.userMessage || err.message || 'Failed to update user information';
        res.status(500).json({
          errorCode: err.errorCode,
          userMessage: errorMessage,
        });
      }
    });
  });

  describe('Rejection of Unknown Keys (Pentest Finding)', () => {
    it('should reject request with unknown "random" key and return 400', async () => {
      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        random: 'unexpected_data',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Invalid request: unknown fields provided',
      });
      expect(response.body.details).toContain('random');
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });

    it('should reject request with large payload in unknown key', async () => {
      const largePayload = 'A'.repeat(5000);
      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        random: largePayload,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });

    it('should reject request with multiple unknown keys', async () => {
      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        malicious_field1: 'data1',
        malicious_field2: 'data2',
        unexpected: 'value',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Invalid request: unknown fields provided',
      });
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });
  });

  describe('Payload Size Limits', () => {
    it('should reject oversized payload (>10KB)', async () => {
      // Create a payload larger than 10KB
      const largeString = 'X'.repeat(12000);
      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: largeString,
        last_name: 'Doe',
        email: 'john@example.com',
      });

      expect(response.status).toBe(413);
      expect(response.body).toMatchObject({
        error: 'Payload Too Large',
        message: expect.stringContaining('Request payload exceeds maximum size'),
      });
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });

    it('should accept payload within size limits', async () => {
      mockUpdateUserInfo.mockResolvedValue(true);

      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalled();
    });
  });

  describe('Malformed Requests', () => {
    it('should reject empty request body', async () => {
      const response = await request(app).post('/profile/updateuser').send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Request body is required',
      });
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });

    it('should reject request with missing required fields', async () => {
      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        // missing last_name and email
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });

    it('should reject request with invalid email format', async () => {
      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'not-an-email',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'Bad Request',
      });
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });

    it('should reject request with invalid data types', async () => {
      const response = await request(app).post('/profile/updateuser').send({
        id: 'not-a-number',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad Request');
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });
  });

  describe('Valid Requests', () => {
    it('should accept valid minimal request', async () => {
      mockUpdateUserInfo.mockResolvedValue(true);

      const response = await request(app).post('/profile/updateuser').send({
        id: 1, // Same as authenticated user ID in session
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 1, // Uses authenticated user ID
          user_first_name: 'John',
          user_last_name: 'Doe',
          user_email: 'john@example.com',
        })
      );
    });

    it('should accept valid complete request with all fields', async () => {
      mockUpdateUserInfo.mockResolvedValue(true);

      const response = await request(app)
        .post('/profile/updateuser')
        .send({
          id: 1, // Same as authenticated user ID
          first_name: 'Jane',
          middle_initial: 'M',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1-555-0100',
          title_id: 5,
          other_title: 'Senior Engineer',
          access_level_id: 2,
          enableAlerts: true,
          geographies: [1, 2, 3],
          commodities: [10, 20],
          auth_preference_id: 1,
          marketing_email_opt_out: true,
        });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 1, // Uses authenticated user ID
          user_first_name: 'Jane',
          user_middle_initial: 'M',
          user_last_name: 'Smith',
          user_email: 'jane.smith@example.com',
          user_phone: '+1-555-0100',
          user_title_id: 5,
          other_title: 'Senior Engineer',
          access_level_id: 2,
          email_subscription: 1, // boolean true converted to 1
          arr_user_geography_ids: [1, 2, 3],
          arr_user_commodity_ids: [10, 20],
          user_auth_preference_id: 1,
          marketing_email_opt_out: true,
        })
      );
    });

    it('should properly trim whitespace from input fields', async () => {
      mockUpdateUserInfo.mockResolvedValue(true);

      const response = await request(app).post('/profile/updateuser').send({
        id: 1, // Same as authenticated user ID
        first_name: '  John  ',
        last_name: '  Doe  ',
        email: '  john@example.com  ',
      });

      expect(response.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          user_first_name: 'John',
          user_last_name: 'Doe',
          user_email: 'john@example.com',
        })
      );
    });
  });

  describe('Application Stability', () => {
    it('should handle validation errors without affecting profile availability', async () => {
      // This test ensures that validation errors don't crash the application
      const response1 = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        unknown_field: 'should be rejected',
      });

      expect(response1.status).toBe(400);

      // Subsequent valid request should still work
      mockUpdateUserInfo.mockResolvedValue(true);
      const response2 = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      });

      expect(response2.status).toBe(200);
      expect(mockUpdateUserInfo).toHaveBeenCalled();
    });

    it('should return proper error response on backend failure', async () => {
      mockUpdateUserInfo.mockRejectedValue({
        userMessage: 'Database error',
      });

      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      });

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        userMessage: 'Database error',
      });
    });
  });

  describe('Field Length Constraints', () => {
    it('should reject first_name exceeding 35 characters', async () => {
      const response = await request(app)
        .post('/profile/updateuser')
        .send({
          id: 1,
          first_name: 'A'.repeat(36),
          last_name: 'Doe',
          email: 'john@example.com',
        });

      expect(response.status).toBe(400);
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });

    it('should reject email exceeding 50 characters', async () => {
      const longEmail = 'a'.repeat(39) + '@example.com'; // 51 chars total (39 + 12)
      const response = await request(app).post('/profile/updateuser').send({
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: longEmail,
      });

      expect(response.status).toBe(400);
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });

    it('should reject geographies array with >100 items', async () => {
      const response = await request(app)
        .post('/profile/updateuser')
        .send({
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          geographies: Array.from({ length: 101 }, (_, i) => i),
        });

      expect(response.status).toBe(400);
      expect(mockUpdateUserInfo).not.toHaveBeenCalled();
    });
  });
});

import { OrganizationLookupService } from './organization-lookup.service';
import { SQLUtils } from '@wri-monorepos/sql';
import { Request } from 'express';

// Mock the SQLUtils module
jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDBFirstRow: jest.fn(),
  },
  getVerifiedUserRouteInfo: 'SELECT UR.user_email, US.user_secret, UR.organization_id, UR.organization_user_id, UR.organization_user_status_id, OG.organization_name, OG.organization_db, OG.organization_status_id, OG.subscription_status_id FROM UserRoutes UR LEFT JOIN UserSecrets US ON UR.user_email = US.user_email LEFT JOIN Organizations OG ON UR.organization_id = OG.id WHERE UR.user_email = @userEmail AND UR.organization_user_status_id <> 3',
}));

describe('OrganizationLookupService', () => {
  const originalEnv = process.env.MSSQL_DATABASE;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MSSQL_DATABASE = 'test-db';
  });

  afterEach(() => {
    process.env.MSSQL_DATABASE = originalEnv;
  });

  describe('lookupOrganizationIdByEmail', () => {
    it('should return organization_id when found', async () => {
      const mockUserRouteInfo = {
        user_email: 'test@example.com',
        organization_id: 123,
        organization_user_id: 456,
        organization_user_status_id: 1,
        organization_name: 'Test Org',
        organization_db: 'test_db',
        organization_status_id: 1,
        subscription_status_id: 1,
      };

      (SQLUtils.queryDBFirstRow as jest.Mock).mockResolvedValue(mockUserRouteInfo);

      const result = await OrganizationLookupService.lookupOrganizationIdByEmail('test@example.com');

      expect(result).toBe(123);
      expect(SQLUtils.queryDBFirstRow).toHaveBeenCalledWith(
        'test-db',
        expect.anything(),
        expect.arrayContaining([
          expect.objectContaining({
            field: 'userEmail',
            value: 'test@example.com',
          }),
        ])
      );
    });

    it('should return undefined when MSSQL_DATABASE is not set', async () => {
      delete process.env.MSSQL_DATABASE;
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await OrganizationLookupService.lookupOrganizationIdByEmail('test@example.com');

      expect(result).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'MSSQL_DATABASE environment variable not set, cannot lookup organization_id'
      );
      expect(SQLUtils.queryDBFirstRow).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should return undefined when user not found', async () => {
      (SQLUtils.queryDBFirstRow as jest.Mock).mockResolvedValue(undefined);

      const result = await OrganizationLookupService.lookupOrganizationIdByEmail('notfound@example.com');

      expect(result).toBeUndefined();
    });

    it('should return undefined when email is empty', async () => {
      const result = await OrganizationLookupService.lookupOrganizationIdByEmail('');

      expect(result).toBeUndefined();
      expect(SQLUtils.queryDBFirstRow).not.toHaveBeenCalled();
    });

    it('should return undefined when email is null', async () => {
      const result = await OrganizationLookupService.lookupOrganizationIdByEmail(null as unknown as string);

      expect(result).toBeUndefined();
      expect(SQLUtils.queryDBFirstRow).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      (SQLUtils.queryDBFirstRow as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await OrganizationLookupService.lookupOrganizationIdByEmail('test@example.com');

      expect(result).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to lookup organization_id by email:',
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('extractUserEmail', () => {
    it('should extract email from req.body', () => {
      const req = {
        body: {
          userEmail: 'body@example.com',
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserEmail(req);

      expect(result).toBe('body@example.com');
    });

    it('should extract email from req.body with user_email field', () => {
      const req = {
        body: {
          user_email: 'body-email@example.com',
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserEmail(req);

      expect(result).toBe('body-email@example.com');
    });

    it('should extract email from req.headers', () => {
      const req = {
        headers: {
          'x-user-email': 'header@example.com',
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserEmail(req);

      expect(result).toBe('header@example.com');
    });

    it('should prefer req.body over req.headers', () => {
      const req = {
        body: {
          userEmail: 'body@example.com',
        },
        headers: {
          'x-user-email': 'header@example.com',
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserEmail(req);

      expect(result).toBe('body@example.com');
    });

    it('should return undefined when email not found', () => {
      const req = {} as unknown;

      const result = OrganizationLookupService.extractUserEmail(req);

      expect(result).toBeUndefined();
    });
  });

  describe('extractUserId', () => {
    it('should extract user_id from req.body', () => {
      const req = {
        body: {
          user_id: 789,
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserId(req);

      expect(result).toBe(789);
    });

    it('should extract userId from req.body (camelCase)', () => {
      const req = {
        body: {
          userId: 101112,
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserId(req);

      expect(result).toBe(101112);
    });

    it('should extract user_id from req.body as string', () => {
      const req = {
        body: {
          user_id: '789',
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserId(req);

      expect(result).toBe(789);
    });

    it('should extract user_id from req.headers', () => {
      const req = {
        headers: {
          'x-user-id': 456,
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserId(req);

      expect(result).toBe(456);
    });

    it('should extract user_id from req.headers as string', () => {
      const req = {
        headers: {
          'x-user-id': '456',
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserId(req);

      expect(result).toBe(456);
    });

    it('should prefer req.body over req.headers', () => {
      const req = {
        body: {
          user_id: 789,
        },
        headers: {
          'x-user-id': 456,
        },
      } as unknown;

      const result = OrganizationLookupService.extractUserId(req);

      expect(result).toBe(789);
    });

    it('should return undefined when user_id not found', () => {
      const req = {} as unknown;

      const result = OrganizationLookupService.extractUserId(req);

      expect(result).toBeUndefined();
    });
  });

  describe('extractOrganizationId', () => {
    it('should extract organization_id from req.body', () => {
      const req = {
        body: {
          organization_id: 123,
        },
      } as unknown;

      const result = OrganizationLookupService.extractOrganizationId(req);

      expect(result).toBe(123);
    });

    it('should extract organizationId from req.body (camelCase)', () => {
      const req = {
        body: {
          organizationId: 456,
        },
      } as unknown;

      const result = OrganizationLookupService.extractOrganizationId(req);

      expect(result).toBe(456);
    });

    it('should extract organization_id from req.body as string', () => {
      const req = {
        body: {
          organization_id: '123',
        },
      } as unknown;

      const result = OrganizationLookupService.extractOrganizationId(req);

      expect(result).toBe(123);
    });

    it('should extract organization_id from req.headers', () => {
      const req = {
        headers: {
          'x-organization-id': 789,
        },
      } as unknown;

      const result = OrganizationLookupService.extractOrganizationId(req);

      expect(result).toBe(789);
    });

    it('should extract organization_id from req.headers as string', () => {
      const req = {
        headers: {
          'x-organization-id': '789',
        },
      } as unknown;

      const result = OrganizationLookupService.extractOrganizationId(req);

      expect(result).toBe(789);
    });

    it('should prefer req.body over req.headers', () => {
      const req = {
        body: {
          organization_id: 123,
        },
        headers: {
          'x-organization-id': 789,
        },
      } as unknown;

      const result = OrganizationLookupService.extractOrganizationId(req);

      expect(result).toBe(123);
    });

    it('should return undefined when organization_id not found', () => {
      const req = {} as unknown;

      const result = OrganizationLookupService.extractOrganizationId(req);

      expect(result).toBeUndefined();
    });
  });
});

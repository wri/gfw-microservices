import { SQLUtils } from '@wri-monorepos/sql';
import { getVerifiedUserRouteInfo } from '@wri-monorepos/sql';
import * as sql from 'mssql';

interface UserRouteInfo {
  user_email: string;
  organization_id: number;
  organization_user_id: number;
  organization_user_status_id: number;
  organization_name: string;
  organization_db: string;
  organization_status_id: number;
  subscription_status_id: number;
}

/**
 * Service to look up organization_id from database using user_id or user_email
 */
export class OrganizationLookupService {
  /**
   * Look up organization_id from system database using user_email
   * @param userEmail - User email address
   * @returns Organization ID if found, undefined otherwise
   */
  static async lookupOrganizationIdByEmail(userEmail: string): Promise<number | undefined> {
    if (!userEmail) {
      return undefined;
    }

    try {
      // Use system database from environment variable
      const systemDatabase = process.env.MSSQL_DATABASE;
      if (!systemDatabase) {
        console.warn('MSSQL_DATABASE environment variable not set, cannot lookup organization_id');
        return undefined;
      }

      const result = await SQLUtils.queryDBFirstRow<UserRouteInfo>(
        systemDatabase,
        getVerifiedUserRouteInfo,
        [
          {
            field: 'userEmail',
            type: sql.NVarChar(250),
            value: userEmail,
          },
        ]
      );

      return result?.organization_id;
    } catch (error) {
      // Log error but don't throw - we don't want to fail the request if lookup fails
      console.warn('Failed to lookup organization_id by email:', error);
      return undefined;
    }
  }

  /**
   * Extract user email from request object
   * Checks req.body and req.headers
   * @param req - Express request object
   * @returns User email if found, undefined otherwise
   */
  static extractUserEmail(req: unknown): string | undefined {
    if (!req || typeof req !== 'object') {
      return undefined;
    }

    const request = req as Record<string, unknown>;

    // Check req.body first (common in API requests)
    if (request.body && typeof request.body === 'object') {
      const body = request.body as Record<string, unknown>;
      if (typeof body.userEmail === 'string') {
        return body.userEmail;
      }
      if (typeof body.user_email === 'string') {
        return body.user_email;
      }
    }

    // Check req.headers (alternative source)
    if (request.headers && typeof request.headers === 'object') {
      const headers = request.headers as Record<string, unknown>;
      const userEmailHeader = headers['x-user-email'] || headers['user-email'];
      if (typeof userEmailHeader === 'string') {
        return userEmailHeader;
      }
    }

    return undefined;
  }

  /**
   * Extract user_id from request object
   * Checks req.headers first (for inter-service calls), then req.body (for direct client requests)
   * @param req - Express request object
   * @returns User ID if found, undefined otherwise
   */
  static extractUserId(req: unknown): number | undefined {
    if (!req || typeof req !== 'object') {
      return undefined;
    }

    const request = req as Record<string, unknown>;

    // Check req.headers first (for inter-service communication)
    if (request.headers && typeof request.headers === 'object') {
      const headers = request.headers as Record<string, unknown>;
      const userIdHeader = headers['x-user-id'] || headers['user-id'];
      if (typeof userIdHeader === 'number') {
        return userIdHeader;
      }
      if (typeof userIdHeader === 'string') {
        const parsed = parseInt(userIdHeader, 10);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }

    // Check req.body (for direct client requests)
    if (request.body && typeof request.body === 'object') {
      const body = request.body as Record<string, unknown>;
      if (typeof body.user_id === 'number') {
        return body.user_id;
      }
      if (typeof body.userId === 'number') {
        return body.userId;
      }
      // Try parsing string values
      if (typeof body.user_id === 'string') {
        const parsed = parseInt(body.user_id, 10);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
      if (typeof body.userId === 'string') {
        const parsed = parseInt(body.userId, 10);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract organization_id from request object
   * Checks req.headers first (for inter-service calls), then req.body (for direct client requests)
   * @param req - Express request object
   * @returns Organization ID if found, undefined otherwise
   */
  static extractOrganizationId(req: unknown): number | undefined {
    if (!req || typeof req !== 'object') {
      return undefined;
    }

    const request = req as Record<string, unknown>;

    // Check req.headers first (for inter-service communication)
    if (request.headers && typeof request.headers === 'object') {
      const headers = request.headers as Record<string, unknown>;
      const orgIdHeader = headers['x-organization-id'] || headers['organization-id'];
      if (typeof orgIdHeader === 'number') {
        return orgIdHeader;
      }
      if (typeof orgIdHeader === 'string') {
        const parsed = parseInt(orgIdHeader, 10);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }

    // Check req.body (for direct client requests)
    if (request.body && typeof request.body === 'object') {
      const body = request.body as Record<string, unknown>;
      if (typeof body.organization_id === 'number') {
        return body.organization_id;
      }
      if (typeof body.organizationId === 'number') {
        return body.organizationId;
      }
      // Try parsing string values
      if (typeof body.organization_id === 'string') {
        const parsed = parseInt(body.organization_id, 10);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
      if (typeof body.organizationId === 'string') {
        const parsed = parseInt(body.organizationId, 10);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }

    return undefined;
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { traceContext } from './trace.context';
import { OrganizationLookupService } from './organization-lookup.service';

export const TRACE_ID_HEADER = 'x-trace-id';

// Extend Request interface to include trace ID
declare module 'express-serve-static-core' {
  interface Request {
    traceId?: string;
  }
}

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Get trace ID from header or generate a new one if not present
    let traceId = req.headers[TRACE_ID_HEADER] as string;

    if (!traceId) {
      traceId = traceContext.generateTraceId();
    }

    // Store trace ID in request object as fallback
    req.traceId = traceId;

    // Add trace ID to response headers for client tracking
    res.setHeader(TRACE_ID_HEADER, traceId);

    // Extract organization_id and user_id from request
    // Priority: headers (forwarded from other services) > body (direct requests)
    // traceId comes from header, organization_id and user_id can come from headers or body
    let organizationId = OrganizationLookupService.extractOrganizationId(req);
    const userId = OrganizationLookupService.extractUserId(req);

    // If organization_id is missing but we have user_email, try to look it up from database
    // Note: We can only look up by user_email, not by user_id (would need organization database)
    if (!organizationId) {
      const userEmail = OrganizationLookupService.extractUserEmail(req);
      if (userEmail) {
        try {
          const lookedUpOrgId = await OrganizationLookupService.lookupOrganizationIdByEmail(
            userEmail
          );
          if (lookedUpOrgId) {
            organizationId = lookedUpOrgId;
          }
        } catch (error) {
          // Log error but don't fail the request if lookup fails
          console.warn('Failed to lookup organization_id from database:', error);
        }
      }
    }

    // Run the rest of the request in the trace context
    // This provides isolated context for each request
    try {
      traceContext.run(
        traceId,
        () => {
          next();
        },
        organizationId,
        userId
      );
    } catch (error) {
      // Fallback: if AsyncLocalStorage fails, continue with request-based tracing
      console.warn('AsyncLocalStorage failed, falling back to request-based tracing:', error);
      next();
    }
  }
}

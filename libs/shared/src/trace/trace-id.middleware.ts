import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { traceContext } from './trace.context';

export const TRACE_ID_HEADER = 'x-trace-id';

// Extend Request interface to include trace ID
declare module 'express-serve-static-core' {
  interface Request {
    traceId?: string;
  }
}

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get trace ID from header or generate a new one if not present
    let traceId = req.headers[TRACE_ID_HEADER] as string;

    if (!traceId) {
      traceId = traceContext.generateTraceId();
    }

    // Store trace ID in request object as fallback
    req.traceId = traceId;

    // Add trace ID to response headers for client tracking
    res.setHeader(TRACE_ID_HEADER, traceId);

    // Run the rest of the request in the trace context
    // This provides isolated context for each request
    try {
      traceContext.run(traceId, () => {
        next();
      });
    } catch (error) {
      // Fallback: if AsyncLocalStorage fails, continue with request-based tracing
      console.warn('AsyncLocalStorage failed, falling back to request-based tracing:', error);
      next();
    }
  }
}

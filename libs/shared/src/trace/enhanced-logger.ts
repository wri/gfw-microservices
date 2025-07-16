import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { traceContext } from './trace.context';

/**
 * Enhanced logger that automatically includes trace IDs in log messages.
 *
 * Provides multiple fallback mechanisms for trace ID retrieval:
 * 1. AsyncLocalStorage (primary)
 * 2. Request object (fallback)
 * 3. Thread-local variable (emergency fallback)
 */
export class EnhancedTraceLogger extends ConsoleLogger {
  private static currentRequest: any = null;

  /**
   * Set the current request for fallback trace ID retrieval
   * This is used when AsyncLocalStorage is not available
   */
  static setCurrentRequest(req: any) {
    EnhancedTraceLogger.currentRequest = req;
  }

  /**
   * Clear the current request reference
   */
  static clearCurrentRequest() {
    EnhancedTraceLogger.currentRequest = null;
  }

  protected printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _writeStreamType?: 'stdout' | 'stderr'
  ) {
    messages.forEach((message) => {
      const traceId = this.getTraceId();
      const pidMessage = this.formatPid(process.pid);
      const contextMessage = this.formatContext(context);
      const timestampDiff = this.updateAndGetTimestampDiff();
      const formattedLogLevel = logLevel.toUpperCase().padStart(7, ' ');

      // Include trace ID in the formatted message if available
      const tracePrefix = traceId ? `[traceId:${traceId}] ` : '';

      const formattedMessage = this.formatMessage(
        logLevel,
        `${tracePrefix}${message}`,
        pidMessage,
        formattedLogLevel,
        contextMessage,
        timestampDiff
      );

      if (logLevel === 'error') {
        console.error(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    });
  }

  /**
   * Get trace ID with multiple fallback mechanisms
   */
  private getTraceId(): string {
    try {
      // Primary: Try AsyncLocalStorage
      const traceId = traceContext.getTraceId();
      if (traceId) {
        return traceId;
      }

      // Fallback 1: Try request object
      if (EnhancedTraceLogger.currentRequest?.traceId) {
        return EnhancedTraceLogger.currentRequest.traceId;
      }

      // Fallback 2: Try to get from context info
      const contextInfo = traceContext.getContextInfo();
      if (contextInfo?.traceId) {
        return contextInfo.traceId;
      }

      return '';
    } catch (error) {
      // Emergency fallback: return empty string
      return '';
    }
  }
}

/**
 * Middleware helper to set request context for logging
 */
export function setRequestForLogging(req: any, res: any, next: any) {
  EnhancedTraceLogger.setCurrentRequest(req);

  // Clear request reference when response finishes
  res.on('finish', () => {
    EnhancedTraceLogger.clearCurrentRequest();
  });

  next();
}

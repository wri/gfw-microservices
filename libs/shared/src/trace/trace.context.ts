import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

interface TraceContext {
  traceId: string;
  requestId?: string;
  timestamp?: number;
}

/**
 * Trace Context Service that provides request-scoped trace ID management.
 *
 * AsyncLocalStorage is specifically designed for this use case and handles
 * multiple concurrent requests correctly - each request gets its own isolated context.
 */
class TraceContextService {
  private static instance: TraceContextService;
  private als = new AsyncLocalStorage<TraceContext>();
  private fallbackTraceId = '';

  static getInstance(): TraceContextService {
    if (!TraceContextService.instance) {
      TraceContextService.instance = new TraceContextService();
    }
    return TraceContextService.instance;
  }

  /**
   * Run a function with a trace context
   * @param traceId The trace ID to use for this context
   * @param fn The function to run within the trace context
   * @returns The result of the function
   */
  run<T>(traceId: string, fn: () => T): T {
    const context: TraceContext = {
      traceId,
      requestId: this.generateRequestId(),
      timestamp: Date.now(),
    };

    try {
      return this.als.run(context, fn);
    } catch (error) {
      // Fallback: if AsyncLocalStorage fails, set a temporary fallback
      this.fallbackTraceId = traceId;
      try {
        return fn();
      } finally {
        this.fallbackTraceId = '';
      }
    }
  }

  /**
   * Get the current trace ID from the async local storage
   * @returns The trace ID if available, empty string otherwise
   */
  getTraceId(): string {
    try {
      const context = this.als.getStore();
      if (context?.traceId) {
        return context.traceId;
      }

      // Fallback to temporary trace ID if available
      if (this.fallbackTraceId) {
        return this.fallbackTraceId;
      }

      return '';
    } catch (error) {
      // In case of any AsyncLocalStorage errors, return fallback or empty
      return this.fallbackTraceId || '';
    }
  }

  /**
   * Generate a new trace ID (UUID v4)
   */
  generateTraceId(): string {
    return randomUUID();
  }

  /**
   * Generate a new request ID for internal tracking
   */
  private generateRequestId(): string {
    return randomUUID();
  }

  /**
   * Check if a trace context is currently active
   */
  hasActiveContext(): boolean {
    try {
      return !!this.als.getStore() || !!this.fallbackTraceId;
    } catch (error) {
      return !!this.fallbackTraceId;
    }
  }

  /**
   * Get full context information for debugging
   */
  getContextInfo(): TraceContext | null {
    try {
      return this.als.getStore() || null;
    } catch (error) {
      return this.fallbackTraceId ? { traceId: this.fallbackTraceId } : null;
    }
  }
}

export const traceContext = TraceContextService.getInstance();

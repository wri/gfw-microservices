import axios from 'axios';
import { traceContext } from './trace.context';

/**
 * Global axios configuration that automatically adds trace ID headers to all requests.
 * This should be called once during application startup to configure all axios instances.
 */
export function configureGlobalAxiosTracing(): void {
  // Add request interceptor to all axios instances globally
  axios.interceptors.request.use(
    (config) => {
      try {
        const traceId = traceContext.getTraceId();
        if (traceId && config.headers) {
          config.headers['X-Trace-ID'] = traceId;
        }
      } catch (error) {
        // Silently fail - don't break requests if trace ID retrieval fails
        console.debug('Failed to add trace ID to request:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

/**
 * Initialize global axios tracing. Call this once in your main.ts file.
 */
export function initializeGlobalAxiosTracing(): void {
  configureGlobalAxiosTracing();
  console.log('Global axios tracing initialized');
}

import axios from 'axios';
import { traceContext } from './trace.context';

/**
 * Global axios configuration that automatically adds trace ID, organization ID, and user ID headers to all requests.
 * This should be called once during application startup to configure all axios instances.
 * These headers allow trace context to be forwarded between microservices.
 */
export function configureGlobalAxiosTracing(): void {
  // Add request interceptor to all axios instances globally
  axios.interceptors.request.use(
    (config) => {
      try {
        const traceId = traceContext.getTraceId();
        const organizationId = traceContext.getOrganizationId();
        const userId = traceContext.getUserId();

        if (config.headers) {
          // Forward trace ID
          if (traceId) {
            config.headers['x-trace-id'] = traceId;
          }

          // Forward organization ID
          if (organizationId !== undefined) {
            config.headers['x-organization-id'] = organizationId.toString();
          }

          // Forward user ID
          if (userId !== undefined) {
            config.headers['x-user-id'] = userId.toString();
          }
        }
      } catch (error) {
        // Silently fail - don't break requests if trace context retrieval fails
        console.debug('Failed to add trace context to request:', error);
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

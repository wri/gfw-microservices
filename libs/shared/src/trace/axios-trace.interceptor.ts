import { AxiosRequestConfig } from 'axios';
import { traceContext } from './trace.context';
import { TRACE_ID_HEADER } from './trace-id.middleware';

/**
 * Axios request interceptor that automatically adds trace ID header to outgoing requests
 */
export function traceIdRequestInterceptor(config: AxiosRequestConfig): AxiosRequestConfig {
  const traceId = traceContext.getTraceId();

  if (traceId) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers[TRACE_ID_HEADER] = traceId;
  }

  return config;
}

/**
 * Utility function to configure axios instance with trace ID interceptor
 */
export function configureAxiosWithTraceId(axiosInstance: any) {
  axiosInstance.interceptors.request.use(traceIdRequestInterceptor);
  return axiosInstance;
}

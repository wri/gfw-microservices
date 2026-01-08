/* eslint-disable */

import axios from 'axios';
const APP_HOST = process.env.HOST ?? 'localhost';
const APP_PORT = process.env.PORT ?? 3335;

module.exports = async function () {
  // Configure axios for tests to use.
  axios.defaults.baseURL = `http://${APP_HOST}:${APP_PORT}`;

  // Add response interceptor to remove circular references from axios responses
  // This prevents "Converting circular structure to JSON" errors when Jest workers
  // try to serialize test results
  axios.interceptors.response.use(
    (response) => {
      // Create a clean response object without circular references
      return {
        status: response.status,
        statusText: response.statusText,
        headers: { ...response.headers },
        data: response.data,
        config: {
          url: response.config.url,
          method: response.config.method,
          headers: response.config.headers,
        },
      };
    },
    (error) => {
      // Don't intercept errors - let them pass through naturally
      // The postRedirectHeaders function needs to handle 302 errors itself
      throw error;
    }
  );
};

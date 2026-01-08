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
      // If there's a response in the error, clean it up too
      if (error.response) {
        const cleanError: any = new Error(error.message);
        cleanError.name = error.name;
        cleanError.stack = error.stack;
        cleanError.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: { ...error.response.headers },
          data: error.response.data,
        };
        cleanError.status = error.response.status;
        throw cleanError;
      }
      throw error;
    }
  );
};

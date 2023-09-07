/* eslint-disable */

import axios from 'axios';
const APP_HOST = process.env.HOST ?? 'localhost';
const APP_PORT = process.env.PORT ?? 3336;

module.exports = async function () {
  // Configure axios for tests to use.
  axios.defaults.baseURL = `http://${APP_HOST}:${APP_PORT}`;
};

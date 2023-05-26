/** ******************************************************************
 *   @name: speakeasy.utils.js
 *   @description : A utility file to work with Speakeasy to create
 *                 secret keys, tokens, and multifactored
 *                 authentication for users.
 *
 *   @function {createSecret}
 *   @function {createTotp}
 *   @function {createQRCode}
 *   @function {validateToken}
 ********************************************************************/
// Imports for this utility file
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

/**
 * @function createSecret
 * @summary Creates a secret key for User - will be used in future to validate and generate TOTP token
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @return {String} Returns base 32 string of the user secret
 */
const createSecret = () => {
  const secret = speakeasy.generateSecret({ length: 32 });
  return secret.base32;
};

/**
 * @function createTotp
 * @summary Creates a time-based token to validate against the User's secret key
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} secret - User's secret key created from createSecret utility function
 * @return {Promise} Returns a promise detailing success or failure of createSecret
 */
const createTotp = (req, secret) => {
  const promise = new Promise((resolve) => {
    const token = speakeasy.totp({ secret: secret, encoding: 'base32' });
    // console.log('Time based token: ', token);
    resolve(token);
  });
  return promise;
};

/**
 * @function getSecret
 * @summary Returns the users secret key
 * @param {String} secret - User's secret key created from createSecret utility function
 * @return {String} Returns a promise detailing success or failure of createSecret
 */
const getSecret = (secret, email) => {
  const url = (key) =>
    `otpauth://totp/${email}?secret=${key}&issuer=${encodeURIComponent('Global Forest Watch Pro')}`;
  return {
    secret,
    url: url(secret),
  };
};

/**
 * @function validateToken
 * @summary Creates a time-based token to validate against the User's secret key
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} secret - User's secret key created from createSecret utility function
 * @param {String} token - User's token input
 * @return {Promise} Returns a promise detailing success or failure of createSecret
 */
const validateToken = (req, secret, token) => {
  const promise = new Promise((resolve) => {
    const validate = speakeasy.totp.verify({
      encoding: 'base32',
      secret: secret,
      window: 10,
      token: token,
    });
    resolve(validate);
  });
  return promise;
};

// Initialize function
function initialize() {}

// Module Exports of utility functions
module.exports = {
  initialize,
  createSecret,
  getSecret,
  createTotp,
  validateToken,
};

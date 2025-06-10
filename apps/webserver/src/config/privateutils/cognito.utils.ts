/** ******************************************************************
 *   @name: cognito.utils.js
 *   @description : A utility file to allow calling various
 *                 functionality from Cognito to signup and
 *                 authenticate users.
 *
 *   @function {authenticateUser}
 *   @function {initialize}
 *   @function {createUser}
 *   @function {deleteUser}
 *   @function {disableUser}
 *   @function {updateUser}
 *   @function {userExists}
 *   @function {confirmUserEmail}
 *   Passwords
 *   @function {completeNewPasswordChallenge}
 *   @function {setPassword}
 *   @function {changePassword}
 *   @function {requestToResetPassword}
 *   @function {confirmForgotPassword}
 *
 ********************************************************************/
// Imports required for this module
import config from '../config';
const AUTH_STATUS = config.platformVars.authenticationStatus;
const { region: REGION, userpoolId: USER_POOL_ID, clientId: CLIENT_ID } = config.AWSVars.cognito;

import * as cognito from '@aws-sdk/client-cognito-identity-provider';

import * as PasswordGenerator from 'generate-password';
import langResources from '../langResources'; // Adjust the path if necessary
import * as errorUtils from './error.utils';
import * as logger from './logger.utils';
import * as crypto from 'crypto';
import {
  InitiateAuthCommandInput,
  InitiateAuthCommandOutput,
  AdminCreateUserCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

// Retry configuration constants
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  DELAY_MS: 1000,
} as const;

// Cognito Client singleton instance
let cognitoClient = null;

interface AuthResult {
  email: string;
  authenticationStatus: number;
  token: string;
  'custom:passwordUpdatedAt': string;
  session?: string;
}

/**
 * @function getCognitoClient
 * @summary Returns a singleton instance of the CognitoIdentityProviderClient.
 *          If one does not exist, it initializes it using the configured region.
 * @returns {CognitoIdentityProviderClient} An initialized CognitoIdentityProviderClient instance
 */
function getCognitoClient() {
  if (!cognitoClient) {
    cognitoClient = new cognito.CognitoIdentityProviderClient({ region: REGION });
  }
  return cognitoClient;
}

/**
 * @function getUserInfo
 * @summary Gets all user info including custom attributes from Cognito
 * @param {String} email - The user email address
 * @param {String} userPoolId - The Cognito user pool id for that environment
 */
const getUserInfo = async (email, userPoolId) => {
  const params = {
    UserPoolId: userPoolId,
    Username: email,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.AdminGetUserCommand(params);

  try {
    const response = await cognitoClient.send(command);
    if (!response || !response.UserAttributes) {
      throw new Error('Invalid response from Cognito');
    }
    return response.UserAttributes;
  } catch (error) {
    logger.error('Error retrieving user info:', error);
    throw error;
  }
};

/**
 * @function resetLoginAttributes
 * @summary Resets the Cognito login attributes for the user: fail_count and passwordUpdatedAt.
 * @param {String} email - The user's email address.
 * @param {String} userPoolId - The Cognito user pool ID for the environment.
 * @returns {Promise<Object>} Result of the AdminUpdateUserAttributesCommand or throws an error.
 */
const resetLoginAttributes = async (email, userPoolId) => {
  const cognitoClient = getCognitoClient();

  const command = new cognito.AdminUpdateUserAttributesCommand({
    UserAttributes: [
      {
        Name: 'custom:fail_count',
        Value: '0',
      },
      {
        Name: 'custom:passwordUpdatedAt',
        Value: new Date().toUTCString(),
      },
    ],
    UserPoolId: userPoolId,
    Username: email,
  });

  try {
    const result = await cognitoClient.send(command);
    return result;
  } catch (error) {
    logger.error('ERROR: could not update user attributes!', error);
    throw error;
  }
};

/**
 * @function setLoginFailCount
 * @summary This sets the Cognito fail count whenever the user fails to login or resets its password.
 * @param {Number} failureCount - The number of fail counts for that particular user
 * @param {String} email - The user email address
 * @param {String} userPoolId - The Cognito user pool id for that environment
 */
const setLoginFailCount = async (failureCount, email, userPoolId) => {
  const params = {
    UserAttributes: [
      {
        Name: 'custom:fail_count',
        Value: failureCount.toString(),
      },
    ],
    UserPoolId: userPoolId,
    Username: email,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.AdminUpdateUserAttributesCommand(params);

  try {
    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    logger.error('Error: Could not update user attributes!', error);
    throw error;
  }
};

/**
 * @function handleUserOpeningPasswordDate
 * @summary Sets `passwordUpdatedAt` attribute in Cognito to the provided date
 * @param {Date} updatedAt - The date to set for the Cognito passwordUpdatedAt attribute
 * @param {String} email - The Cognito username (typically an email)
 * @param {String} userPoolId - The Cognito user pool ID for the environment
 * @returns {Promise<Object|undefined>} Returns the response from Cognito if successful, undefined otherwise
 */
const handleUserOpeningPasswordDate = async (updatedAt, email, userPoolId) => {
  const params = {
    UserAttributes: [
      {
        Name: 'custom:passwordUpdatedAt',
        Value: updatedAt.toUTCString(),
      },
    ],
    UserPoolId: userPoolId,
    Username: email,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.AdminUpdateUserAttributesCommand(params);

  try {
    const data = await cognitoClient.send(command);
    return data;
  } catch (error) {
    logger.error('ERROR: Could not update user attributes!', error);
    return undefined;
  }
};

/**
 * @function lockUserOutOnFailCounts
 * @summary Locks the user's account (sets to RESET_REQUIRED) after multiple failed login attempts.
 * @param {String} email - The user email address
 * @param {String} userPoolId - The Cognito user pool id for that environment
 */
const lockUserOutOnFailCounts = async (email, userPoolId) => {
  const params = {
    UserPoolId: userPoolId,
    Username: email,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.AdminResetUserPasswordCommand(params);

  try {
    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    logger.error('Error: Could not reset user password!:', error);
    throw error;
  }
};

/**
 * @function confirmUserEmail
 * @summary Admin Cognito action to mark user's email as verified.
 * @param {Object} req - Unused but kept for signature consistency (e.g., session use).
 * @param {String} username - Cognito Username.
 * @returns {Promise<Boolean>} Resolves to true on success, or throws on failure.
 */
const confirmUserEmail = async (req, username) => {
  const cognitoClient = getCognitoClient();

  const command = new cognito.AdminUpdateUserAttributesCommand({
    UserAttributes: [{ Name: 'email_verified', Value: 'True' }],
    UserPoolId: USER_POOL_ID,
    Username: username,
  });

  try {
    await cognitoClient.send(command);
    return true;
  } catch (error) {
    logger.error('Failed to confirm user email:', error);
    throw error;
  }
};

/**
 * @function hashEmail
 * @summary Hashes an email address for logging purposes
 * @param {string} email - The email address to hash
 * @returns {string} The hashed email address
 */
const hashEmail = (email: string): string => {
  return crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').substring(0, 8);
};

/**
 *  @function createUser
 *  @summary Create a new user in the identity pool provided.
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - The username of the Cognito user (should be their email)
 *  @param {boolean} shouldResendTempPassword - In case a temporary password needs to be sent back to the user
 *  @param {boolean} isUnitTest - Flag for test context to return password
 *  @return {Promise<Object|Boolean>} Returns result or test output object, depending on context
 */
const createUser = async (req, email, shouldResendTempPassword = false, isUnitTest = false) => {
  const hashedEmail = hashEmail(email);

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    logger.error('Invalid email format:', hashedEmail);
    throw new Error('Invalid email format');
  }

  const randomPassword = PasswordGenerator.generate({
    length: 10,
    numbers: true,
    symbols: false,
    uppercase: true,
    strict: true,
    exclude: '#%&^"',
  });

  const currentDate = new Date().toUTCString();

  const params: AdminCreateUserCommandInput = {
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'custom:fail_count', Value: '0' },
      { Name: 'custom:passwordUpdatedAt', Value: currentDate },
    ],
    DesiredDeliveryMediums: ['EMAIL'],
    ForceAliasCreation: false,
    MessageAction: shouldResendTempPassword ? 'RESEND' : undefined,
    TemporaryPassword: randomPassword,
  };

  try {
    // Create user with retry logic
    await withRetry(
      async () => {
        cognitoClient = getCognitoClient();
        const command = new cognito.AdminCreateUserCommand(params);
        return cognitoClient.send(command);
      },
      {
        operationName: 'user creation',
        identifier: hashedEmail,
      }
    );

    // Confirm user email with retry logic
    logger.info(`Confirming email for user ${hashedEmail}`);
    const result = await withRetry(
      async () => {
        return confirmUserEmail(req, email);
      },
      {
        operationName: 'email confirmation',
        identifier: hashedEmail,
      }
    );

    if (isUnitTest) {
      return {
        password: randomPassword,
        result,
      };
    }

    return result;
  } catch (error) {
    // Enhanced error handling with detailed logging
    if (error.name === 'UsernameExistsException') {
      logger.error(`User creation failed: User with email ${hashedEmail} already exists`);
      throw new Error(`User with email ${email} already exists`);
    } else if (error.name === 'InvalidParameterException') {
      logger.error(`User creation failed: Invalid parameters provided: ${error.message}`);
      throw new Error(`Invalid parameters provided: ${error.message}`);
    } else if (error.name === 'ServiceUnavailableException') {
      logger.error('User creation failed: Cognito service is temporarily unavailable');
      throw new Error('Cognito service is temporarily unavailable');
    }

    logger.error('Error creating Cognito user:', {
      emailHash: hashedEmail,
      error: error.message,
      code: error.code,
      name: error.name,
    });
    throw error;
  }
};

/**
 *  @function changePassword
 *  @summary Change password for an authenticated user
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} previousPassword
 *  @param {String} proposedPassword
 */
const changePassword = async (req, previousPassword, proposedPassword) => {
  const params = {
    AccessToken: req.session.access_token,
    PreviousPassword: previousPassword,
    ProposedPassword: proposedPassword,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.ChangePasswordCommand(params);

  try {
    await cognitoClient.send(command);
    return true;
  } catch (error) {
    logger.error('Error changing password:', error);
    throw error;
  }
};

/**
 *  @function deleteUser
 *  @summary Admin function to delete a user from AWS Cognito.
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - The username of the Cognito user (should be their email).
 *  @return {Promise} Returns a promise detailing success or failure of deleteUser.
 */
const deleteUser = async (req, email) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: email,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.AdminDeleteUserCommand(params);

  try {
    const data = await cognitoClient.send(command);
    return data;
  } catch (error) {
    logger.error('Error deleting user from Cognito:', error);
    throw error;
  }
};

/**
 * @function handleLoginFailure
 * @summary Handles login failure, and if the fail count is >= config.platformVars.maxUserLoginRetries, disable the user by forcing it to the RESET_REQUIRED state in Cognito
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} email - The username of the cognito user (should be their email)
 * @return {Promise} Returns a promise detailing success or failure of disableUser
 */
const handleLoginFailure = async (req, email) => {
  const hashedEmail = hashEmail(email);
  let userInfo;
  try {
    userInfo = await getUserInfo(email, USER_POOL_ID);
  } catch (error) {
    logger.error(`Failed to get user info for ${hashedEmail}:`, error);
    throw error;
  }

  // Find the current fail count for the user
  const userFailCount = userInfo.find(
    (userAttribute) => userAttribute.Name === 'custom:fail_count'
  );
  let failureCount = userFailCount ? Number(userFailCount.Value) : 0;
  failureCount++; // Increment the fail count

  try {
    // Update the fail count in Cognito
    await setLoginFailCount(failureCount, email, USER_POOL_ID);
    logger.info(`Updated fail count to ${failureCount} for user ${hashedEmail}`);

    // If the failure count exceeds the threshold, attempt to lock user
    if (failureCount >= config.platformVars.maxUserLoginRetries) {
      try {
        await lockUserOutOnFailCounts(email, USER_POOL_ID);
        logger.info(
          `Successfully locked user ${hashedEmail} after ${failureCount} failed attempts`
        );
      } catch (lockError) {
        // If we can't lock the user, log it but don't throw - the fail count is still updated
        logger.error(`Failed to lock user ${hashedEmail} after max attempts:`, lockError);
      }
    }
  } catch (error) {
    logger.error(`Failed to update fail count for user ${hashedEmail}:`, error);
    // Don't throw here - we want to return the current state even if we couldn't update it
  }

  // Return success indicating that the account handling was processed
  return true;
};

/**
 * @function withRetry
 * @summary Executes a function with retry logic
 * @param {Function} operation - The async function to execute
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts
 * @param {number} options.delay - Delay between retries in milliseconds
 * @param {string} options.operationName - Name of the operation for logging
 * @param {string} options.identifier - Identifier for the operation (e.g., hashed email)
 * @returns {Promise<any>} The result of the operation
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    operationName: string;
    identifier: string;
  }
): Promise<T> => {
  const maxRetries = options.maxRetries ?? RETRY_CONFIG.MAX_RETRIES;
  const delay = options.delay ?? RETRY_CONFIG.DELAY_MS;
  let retries = maxRetries;

  while (retries > 0) {
    try {
      logger.info(
        `Attempting ${options.operationName} for ${options.identifier} (attempt ${
          maxRetries - retries + 1
        }/${maxRetries})`
      );
      const result = await operation();
      logger.info(`Successfully completed ${options.operationName} for ${options.identifier}`);
      return result;
    } catch (error) {
      if (error.name === 'ServiceUnavailableException' && retries > 1) {
        retries--;
        logger.warn(
          `Service unavailable for ${options.operationName}, retrying in ${delay}ms... (${retries} attempts remaining)`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error(
    `Failed to complete ${options.operationName} after ${maxRetries} attempts`
  );
};

/**
 * @function authenticateUser
 * @summary Authenticate User via Cognito
 * @param {Object} req - Request object
 * @param {String} email - The username of the cognito user (should be their email)
 * @param {String} password - The password given by User
 * @param {Array} userInfoAttributes - User attributes from Cognito
 * @return {Promise<Object>} Authentication result
 */
const authenticateUser = async (req, email, password, userInfoAttributes) => {
  const currentDate = new Date();
  const hashedEmail = hashEmail(email);

  const updatedAttribute = userInfoAttributes.find(
    (userAttribute) => userAttribute.Name === 'custom:passwordUpdatedAt'
  );
  const failCountAttribute = userInfoAttributes.find(
    (userAttribute) => userAttribute.Name === 'custom:fail_count'
  );
  const updatedAt = updatedAttribute?.Value || currentDate;

  if (!updatedAttribute) {
    try {
      logger.info(`Setting initial password update date for user ${hashedEmail}`);
      await handleUserOpeningPasswordDate(updatedAt, email, USER_POOL_ID);
    } catch (error) {
      logger.error(`Failed to set password update date for user ${hashedEmail}:`, error);
      throw error;
    }
  }

  const params: InitiateAuthCommandInput = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  const authResult: AuthResult = {
    email: email,
    authenticationStatus: AUTH_STATUS.Unauthenticated,
    token: '',
    'custom:passwordUpdatedAt': updatedAt,
  };

  try {
    const response = await withRetry<InitiateAuthCommandOutput>(
      () => {
        cognitoClient = getCognitoClient();
        const command = new cognito.InitiateAuthCommand(params);
        return cognitoClient.send(command);
      },
      {
        operationName: 'user authentication',
        identifier: hashedEmail,
      }
    );

    // Handle NEW_PASSWORD_REQUIRED challenge
    if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      logger.info(`User ${hashedEmail} requires new password`);
      authResult.authenticationStatus = AUTH_STATUS.RequireNewPassword;
      authResult.session = response.Session;
      return authResult;
    }

    // Handle successful authentication
    if (response.AuthenticationResult) {
      logger.info(`User ${hashedEmail} successfully authenticated`);
      authResult.authenticationStatus = AUTH_STATUS.Authenticated;
      authResult.token = response.AuthenticationResult.AccessToken;

      // Reset fail count on successful login
      if (failCountAttribute?.Value !== '0') {
        try {
          await setLoginFailCount(0, email, USER_POOL_ID);
          logger.info(`Reset fail count for user ${hashedEmail}`);
        } catch (error) {
          logger.error(`Failed to reset fail count for user ${hashedEmail}:`, error);
          // Don't throw here, as the login was successful
        }
      }

      return authResult;
    }

    // Handle unexpected challenge
    if (response.ChallengeName) {
      logger.warn(
        `Unexpected challenge received for user ${hashedEmail}: ${response.ChallengeName}`
      );
      authResult.authenticationStatus = AUTH_STATUS.Unauthenticated;
      return authResult;
    }

    throw new Error('No authentication result received from Cognito');
  } catch (error) {
    logger.error(`Authentication error for user ${hashedEmail}:`, {
      error: error.message,
      code: error.code,
      name: error.name,
    });

    // Handle password reset required
    if (error.name === 'PasswordResetRequiredException') {
      const failCount = parseInt(failCountAttribute?.Value || '0', 10);
      if (failCount >= config.platformVars.maxUserLoginRetries) {
        logger.info(`User ${hashedEmail} requires forced password reset due to max login attempts`);
        authResult.authenticationStatus = AUTH_STATUS.ForceReset;
      } else {
        logger.info(`User ${hashedEmail} requires password reset`);
        authResult.authenticationStatus = AUTH_STATUS.ResetRequired;
      }
      return authResult;
    }

    // Handle other authentication errors
    try {
      await handleLoginFailure(req, email);
      logger.info(`Handled login failure for user ${hashedEmail}`);
    } catch (loginFailureError) {
      logger.error(`Failed to handle login failure for user ${hashedEmail}:`, loginFailureError);
    }

    const userMessage = langResources.getResourceString('failedToAuthenticate');
    const sysMessage = `Error Authenticating User: ${
      error.message || error
    } \nUsername: ${hashedEmail}`;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToAuthenticate,
      userMessage,
      sysMessage
    );
  }
};

/**
 *  @function setPassword
 *  @summary Sets Cognito User Password
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - The username of the cognito user (should be their email)
 *  @param {String} verificationCode - verification code given by User
 *  @param {String} newPassword - Optional parameter for new Password challenge
 *  @return {Promise} Returns a promise detailing success or failure of setPassword
 */
const setPassword = async (req, email, verificationCode, newPassword) => {
  const params: cognito.ConfirmForgotPasswordCommandInput = {
    Username: email,
    Password: newPassword,
    ConfirmationCode: verificationCode,
    ClientId: CLIENT_ID,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.ConfirmForgotPasswordCommand(params);

  try {
    await cognitoClient.send(command);
    return true; // Successfully set the password
  } catch (err) {
    logger.error('Error setting password', err);
    return false;
  }
};

/**
 *  @function completeNewPasswordChallenge
 *  @summary Allows a user to change their password on initial login.
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} old_password - The user's old password.
 *  @param {String} new_password - The user's new password.
 *  @return {Promise} Returns a promise which returns true is success, error object otherwise.
 */
/**
 * @function completeNewPasswordChallenge
 * @summary Handles the NEW_PASSWORD_REQUIRED challenge
 * @param {Object} req - Request object containing session info
 * @param {String} oldPassword - The temporary password from the initial login
 * @param {String} newPassword - The new password to be set
 * @returns {Promise<Boolean>} - Resolves true if successful, throws error otherwise
 */
const completeNewPasswordChallenge = async (req, oldPassword, newPassword) => {
  const { user_email } = req.session;

  cognitoClient = getCognitoClient();

  const params: cognito.InitiateAuthCommandInput = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: user_email,
      PASSWORD: oldPassword,
    },
  };

  try {
    const authCommand = new cognito.InitiateAuthCommand(params);
    const authResponse = await cognitoClient.send(authCommand);

    if (authResponse.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      const challengeCommand = new cognito.RespondToAuthChallengeCommand({
        ClientId: CLIENT_ID,
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: authResponse.Session,
        ChallengeResponses: {
          USERNAME: user_email,
          NEW_PASSWORD: newPassword,
        },
      });

      await cognitoClient.send(challengeCommand);
      return true;
    }

    // If challenge is not NEW_PASSWORD_REQUIRED, throw error immediately
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAuthenticated,
      langResources.getResourceString('criticalError'),
      `Unexpected challenge received: ${authResponse.ChallengeName}`
    );
  } catch (err) {
    // If the error is already an error message object, throw it directly
    if (err.userMessage && err.systemMessage) {
      throw err;
    }
    // Otherwise, create a new error message
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAuthenticated,
      langResources.getResourceString('loginFailed'),
      err
    );
  }
};

/**
 * @function resendTemporaryPassword
 * @summary Re-sends a temporary password to the user if their account is in Change Password Status
 * @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param  {String} email - The username of the Cognito user (should be their email)
 * @param  {Error} err - The thrown error to check for the message
 * @returns {Promise}
 */
const resendTemporaryPassword = async (req, email, err) => {
  try {
    const userInfo = await getUserInfo(email, USER_POOL_ID);
    const userStatus = userInfo.find((attr) => attr.Name === 'UserStatus')?.Value;

    if (userStatus === 'FORCE_CHANGE_PASSWORD') {
      try {
        // Send another temporary password to the user
        await createUser(req, email, true, false);
        return true; // Successfully re-sent the temporary password
      } catch (createUserErr) {
        logger.error('Error trying to RESEND temporary password:', createUserErr);
        throw createUserErr; // Throw the error to be caught by outer catch block
      }
    } else {
      logger.error('Error AdminResetUserPassword:', err);
      throw err; // Throw error if user is not in FORCE_CHANGE_PASSWORD status
    }
  } catch (getUserInfoErr) {
    logger.error('Error getting user status:', getUserInfoErr);
    throw getUserInfoErr; // Throw error to be handled outside if necessary
  }
};

/**
 *  @function requestToResetPassword
 *  @summary Sends an email to the provided email address. The email contains a verification code,
 *           that a user can use to reset his/her password.
 *  @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param  {String}  email - The username of the cognito user (should be their email)
 *  @return {Promise} Returns a promise that resolves to true if successful, provides error object otherwise.
 */
const requestToResetPassword = async (req, email) => {
  logger.info('Resetting Password');

  const params = {
    ClientId: CLIENT_ID,
    Username: email,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.ForgotPasswordCommand(params);

  try {
    await cognitoClient.send(command);
    return AUTH_STATUS.ConfirmPassword;
  } catch (error) {
    logger.error('Forgot Password Error:', error);

    try {
      await resendTemporaryPassword(req, email, error);
      return AUTH_STATUS.ResendPassword;
    } catch (resendErr) {
      logger.error('Resend Error:', resendErr);
      throw resendErr;
    }
  }
};

/**
 *  @function adminResetUserPassword
 *  @summary Resets the user's password in AWS Cognito. User will need to reset their password.
 *  @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param  {String}  email - The username of the cognito user (should be their email)
 *  @return {Promise<Boolean>} Returns true if the action has been processed correctly
 */
const adminResetUserPassword = async (req, email) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: email,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.AdminResetUserPasswordCommand(params);

  try {
    await cognitoClient.send(command);
    return true;
  } catch (error) {
    logger.error('Error AdminResetUserPassword:', error);
    try {
      await resendTemporaryPassword(req, email, error);
      return true;
    } catch (resendTemporaryPasswordErr) {
      logger.error('Resend Error:', resendTemporaryPasswordErr);
      throw resendTemporaryPasswordErr;
    }
  }
};

/**
 *  @function updateUser
 *  @summary Update Cognito User
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - Cognito Username
 *  @param {Object[]} attributes - Array of Name, Value pair of attributes
 *  @return {Promise} Returns a promise detailing success or failure of disableUser
 */
const updateUser = async (req, email, attributes) => {
  // Parameters required to update user attributes
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: [...attributes],
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.AdminUpdateUserAttributesCommand(params);

  try {
    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

/**
 *  @function userExists
 *  @summary Check if a user exists by leveraging getUserInfo.
 *  @param {String} email - Cognito Username
 *  @return {Promise} Returns a promise detailing success or failure
 */
const userExists = async (email: string) => {
  try {
    // Use getUserInfo to check if the user exists
    await getUserInfo(email, USER_POOL_ID);
    return true;
  } catch (error) {
    if (error.name === 'UserNotFoundException') {
      return false; // User doesn't exist
    }
    logger.error('Unexpected error:', error);
    throw error; // Rethrow if not a "user not found" error
  }
};

/**
 *  @function confirmForgotPassword
 *  @summary API action to confirm forgotten password flow
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} confirmationCode - confirmation code sent to user
 *  @param {String} newPassword - new password
 *  @param {String} username - Username
 *  @return {Promise} Returns a promise detailing success or failure of confirmForgotPassword
 */
const confirmForgotPassword = async (req, confirmationCode, newPassword, username) => {
  const parameters = {
    ClientId: CLIENT_ID,
    ConfirmationCode: confirmationCode,
    Password: newPassword,
    Username: username,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.ConfirmForgotPasswordCommand(parameters);

  try {
    await cognitoClient.send(command);
    return true;
  } catch (error) {
    logger.error('Confirm forgot password error:', error);
    if (error.name === 'ExpiredCodeException' || error.code === 'ExpiredCodeException') {
      return 'ExpiredCodeException';
    }
    throw error;
  }
};

/**
 *  @function resendConfirmationCode
 *  @summary Re-sends the confirmation code to the user
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} username - Username of the user who requested the confirmation code
 *  @return {Promise} Returns a promise detailing success or failure of resendConfirmationCode
 */
const resendConfirmationCode = async (req, username) => {
  const parameters = {
    ClientId: CLIENT_ID,
    Username: username,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.ResendConfirmationCodeCommand(parameters);

  try {
    await cognitoClient.send(command);
    return true; // Successfully resent the confirmation code
  } catch (error) {
    logger.error('Error re-sending confirmation code:', error);
    return false; // Return false on error
  }
};

export {
  resetLoginAttributes,
  requestToResetPassword,
  setPassword,
  authenticateUser,
  deleteUser,
  createUser,
  getCognitoClient as initialize,
  updateUser,
  userExists,
  getUserInfo,
  completeNewPasswordChallenge,
  changePassword,
  confirmUserEmail,
  confirmForgotPassword,
  adminResetUserPassword,
  resendConfirmationCode,
  setLoginFailCount,
  resendTemporaryPassword,
};

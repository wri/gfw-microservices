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

// Cognito Client singleton instance
let cognitoClient = null;

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
    return response.UserAttributes; // Return user attributes
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
    console.error('ERROR: could not update user attributes!', error);
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
    console.error('Error: Could not update user attributes!', error);
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
    console.error('ERROR: Could not update user attributes!', error);
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
    console.error('Error: Could not reset user password!:', error);
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
    console.error('Failed to confirm user email:', error);
    throw error;
  }
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
  const randomPassword = PasswordGenerator.generate({
    length: 10,
    numbers: true,
    symbols: false,
    uppercase: true,
    strict: true,
    exclude: '#%&^"',
  });

  const params: cognito.AdminCreateUserCommandInput = {
    UserPoolId: USER_POOL_ID,
    Username: email,
    UserAttributes: [{ Name: 'email', Value: email }],
    DesiredDeliveryMediums: ['EMAIL'],
    ForceAliasCreation: false,
    MessageAction: shouldResendTempPassword ? 'RESEND' : undefined,
    TemporaryPassword: randomPassword,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.AdminCreateUserCommand(params);

  try {
    await cognitoClient.send(command);
    const result = await confirmUserEmail(req, email);

    if (isUnitTest) {
      return {
        password: randomPassword,
        result,
      };
    }

    return result;
  } catch (error) {
    console.log('Error creating Cognito user:', error);
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
    console.log('Error changing password:', error);
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
    console.log('Error deleting user from Cognito:', error);
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
  let userInfo;
  try {
    userInfo = await getUserInfo(email, USER_POOL_ID);
  } catch (error) {
    console.error('Error:', error);
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

    // If the failure count exceeds the threshold, "disable" user
    if (failureCount >= config.platformVars.maxUserLoginRetries) {
      await lockUserOutOnFailCounts(email, USER_POOL_ID);
    }
  } catch (error) {
    console.error('Error updating fail count or disabling user:', error);
    throw error;
  }

  // Return success indicating that the account handling was processed
  return true;
};

/**
 *  @function authenticateUser
 *  @summary Authenticate User via Cognito
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - The username of the cognito user (should be their email)
 *  @param {String} password - The password given by User
 *  @return {Promise} Returns a promise detailing success or failure of authenticateUser
 */
const authenticateUser = async (req, email, password, userInfoAttributes) => {
  const currentDate = new Date();

  const updatedAttribute = userInfoAttributes.find(
    (userAttribute) => userAttribute.Name === 'custom:passwordUpdatedAt'
  );
  const failCountAttribute = userInfoAttributes.find(
    (userAttribute) => userAttribute.Name === 'custom:fail_count'
  );
  const updatedAt = updatedAttribute.Value || currentDate;

  if (!updatedAttribute) {
    try {
      await handleUserOpeningPasswordDate(updatedAt, email, USER_POOL_ID);
    } catch (error) {
      console.log('Error:', error);
      throw error;
    }
  }

  const params: cognito.InitiateAuthCommandInput = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };

  const authResult = {
    email: email,
    authenticationStatus: AUTH_STATUS.Unauthenticated,
    token: '',
    'custom:passwordUpdatedAt': updatedAt,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.InitiateAuthCommand(params);

  try {
    const response = await cognitoClient.send(command);

    // On success, update the authentication result
    authResult.authenticationStatus = AUTH_STATUS.Authenticated;
    authResult.token = response.AuthenticationResult.AccessToken;
    return authResult;
  } catch (error) {
    // Password reset is required
    if (
      error.name === 'PasswordResetRequiredException' &&
      failCountAttribute?.Value >= config.platformVars.maxUserLoginRetries
    ) {
      authResult.authenticationStatus = AUTH_STATUS.ForceReset;
      return authResult;
    } else if (error.name === 'PasswordResetRequiredException') {
      authResult.authenticationStatus = AUTH_STATUS.ResetRequired;
      return authResult;
    }

    // Handle other authentication errors
    await handleLoginFailure(req, email).catch((e) =>
      logger.error('Error in handleLoginFailure', e)
    );

    const userMessage = langResources.getResourceString('failedToAuthenticate');
    const sysMessage = `Error Authenticating User: ${error} \nUsername: ${email}`;
    const errObj = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToAuthenticate,
      userMessage,
      sysMessage
    );
    throw errObj;
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
    console.log('Error setting password', err);
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
    } else {
      // If no challenge is expected, return error
      const userMessage = langResources.getResourceString('criticalError');
      const sysMessage = langResources.getResourceString('invalidInitialPasswordChange');
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userAlreadyConfirmed,
        userMessage,
        sysMessage
      );
    }
  } catch (err) {
    const userMessage = langResources.getResourceString('loginFailed');
    const sysMessage = err;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAuthenticated,
      userMessage,
      sysMessage
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

    if (userInfo.UserStatus === 'FORCE_CHANGE_PASSWORD') {
      try {
        // Send another temporary password to the user
        await createUser(req, email, true, false);
        return true; // Successfully re-sent the temporary password
      } catch (createUserErr) {
        console.log('Error trying to RESEND temporary password:', createUserErr);
        throw createUserErr; // Throw the error to be caught by outer catch block
      }
    } else {
      console.log('Error AdminResetUserPassword:', err);
      throw err; // Throw error if user is not in FORCE_CHANGE_PASSWORD status
    }
  } catch (getUserInfoErr) {
    console.log('Error getting user status:', getUserInfoErr);
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
  console.log('Resetting Password');

  const params = {
    ClientId: CLIENT_ID,
    Username: email,
  };

  cognitoClient = getCognitoClient();
  const command = new cognito.ForgotPasswordCommand(params);

  try {
    await cognitoClient.send(command);
    // If the command was successful, the verification code is sent to the user
    return AUTH_STATUS.ConfirmPassword;
  } catch (error) {
    console.log('Forgot Password Error:', error);

    // If user is in 'FORCE_CHANGE_PASSWORD' state, attempt to resend temp password
    try {
      await resendTemporaryPassword(req, email, error);
      return AUTH_STATUS.ResendPassword;
    } catch (resendErr) {
      console.log('Resend Error:', resendErr);
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
    console.log('Error AdminResetUserPassword:', error);
    try {
      await resendTemporaryPassword(req, email, error);
      return true;
    } catch (resendTemporaryPasswordErr) {
      console.log('Resend Error:', resendTemporaryPasswordErr);
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
    console.error('Error updating user:', error);
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
    return true; // Successfully confirmed the password
  } catch (error) {
    if (error.code === 'ExpiredCodeException') {
      return 'ExpiredCodeException'; // Handle specific error code
    }
    throw error; // Rethrow other errors
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
    console.log('Error re-sending confirmation code:', error);
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

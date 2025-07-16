/* eslint-disable consistent-return */
/* eslint-disable new-cap */
/* eslint-disable camelcase */
/* eslint-disable import/no-dynamic-require */
/** ******************************************************************
 *   @name: authenticationManager.utils.js
 *   @description : A public utility file to interact with the front end
 *                 regarding authentication
 *
 * @function{login},
 * @function{verifyLogin},
 * @function{setOrgSessions},
 * @function{getOrganizations},
 * @function{logout},
 * @function{getUserInfo},
 * @function{setInitialPassword},
 * @function{changePassword},
 * @function{requestPasswordReset},
 * @function{resendVerifyToken},
 * @function{confirmPasswordReset},
 * @function{adminResetUserPassword}
 *`
 *   List of Session Variables (Not available till success of VerifyLogin):
 *   (Global)
 *   req.session.user_email
 *   req.session.ispromanager
 *   req.session.user_secret
 *
 *   (For Regular Session)
 *   req.session.organization_id
 *   req.session.organization_database
 *   req.session.organization_user_id
 *   req.session.organization_name
 *   req.session.user_access_level_id
 *   req.session.organization_status_id
 *   req.session.user_first_name
 *   req.session.user_last_name
 *
 ******************************************************************* */
// Imports required for this module
const path = require('path');
const sql = require('mssql');
import config from '../config';

// Alias some constants
const { AWSVars: AWS_VARS, platformVars: PLATFORM_VARS } = config;
const { authenticationStatus: AUTH_STATUS } = PLATFORM_VARS;
const { userpoolId: USER_POOL_ID } = AWS_VARS.cognito;

const langResources = require(path.resolve('./config/langResources'));

const awsSes = require(path.resolve('./config/privateutils/ses.utils'));
const awsCognito = require(path.resolve('./config/privateutils/cognito.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));
const speakEasy = require(path.resolve('./config/privateutils/speakeasy.utils'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const { orgAccountStatus } = require(path.resolve('./config/env/orgAccountStatus.constants'));

/**
 * Return true only if the given user and secret are for devtest/AAT use and
 *  current environment is not prod
 * @param {String} email - username
 * @param {String} secret - secret value
 * @returns {boolean}
 */
const isDevTestUser = (email, secret) => {
  return (
    // dt_* users are used by AAT testing in dev, QA, and staging environments, but
    // this hacky way of login bypassing regular checks should not be allowed in prod
    // For added security the secret value is picked up from the environment and not in code
    // Extra security, the user must exist in the DB
    (process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test' ||
      process.env.NODE_ENV === 'qa' ||
      process.env.NODE_ENV === 'staging') &&
    email.startsWith('dt_') &&
    config.devTestUserAuthSecret &&
    secret === config.devTestUserAuthSecret
  );
};

// unsafe variant of login() for devtest use that bypasses Cognito
const unsafeDevOnlyLogin = async (req, username, secret, isProManagerLogin) => {
  if (!isDevTestUser(username, secret)) {
    throw new Error('unsafeDevOnlyLogin only supported in devtest mode for devtest users');
  }
  const normalizedUsername = username.toLocaleLowerCase();
  const params = [{ field: 'userEmail', type: sql.NVarChar(50), value: normalizedUsername }];

  const storedProcString = isProManagerLogin
    ? 'uspGetGFWProRootUserInfo'
    : 'uspGetInitialUserRouteInfo';

  const recordSets = await sqlUtils.executeSystemStoredProcedure(req, storedProcString, params);
  const [userRecord] = recordSets;
  if (!userRecord) {
    throw new Error('UnsafeDevUser not in DB');
  }

  Object.assign(req.session, {
    user_id: userRecord.id,
    user_email: username,
    user_secret: userRecord.user_secret,
    ispromanager: isProManagerLogin,
    access_token: 'SecretAccessToken',
    // Track last activity time
    last_activity_time: new Date(),
  });
  return { authenticationStatus: 1 };
};

/**
 * @function login
 * @summary Performs the initial login sequence.
 * @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} username - username of the user.
 * @param {String} password - password of the user.
 * @param {Boolean} isProManagerLogin - A boolean to determine whether the
 *                 user is logging into pro-manager or the main platform.
 * @return {Promise} A promise object that returns an object with
 *                   authentication info if resolved, otherwise returns an
 *                   error object.
 */
export const login = async (req, username, password, isProManagerLogin = false) => {
  if (isDevTestUser(username, password)) {
    return unsafeDevOnlyLogin(req, username, password, isProManagerLogin);
  }

  const normalizedUsername = username.toLocaleLowerCase();
  const params = [{ field: 'userEmail', type: sql.NVarChar(50), value: normalizedUsername }];
  let authenticationPreference = PLATFORM_VARS.authenticationPreference.Email;
  let authenticatedInformation;
  let speakEasyToken;
  let userRecord;

  try {
    const userInfo = await awsCognito.getUserInfo(normalizedUsername, USER_POOL_ID);

    const authenticationResponse = await awsCognito.authenticateUser(
      req,
      normalizedUsername,
      password,
      userInfo
    );

    const { authenticationStatus, email } = authenticationResponse;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (
      [AUTH_STATUS.Unauthenticated, AUTH_STATUS.Disabled, AUTH_STATUS.ConfirmPassword].includes(
        authenticationStatus
      )
    ) {
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userNotAdmin,
        langResources.getResourceString('loginFailed'),
        `UserEmail: ${email}, Authentication Status: ${authenticationStatus}`
      );
    }

    if ([AUTH_STATUS.ResetRequired, AUTH_STATUS.ForceReset].includes(authenticationStatus)) {
      const userMessage =
        authenticationStatus === AUTH_STATUS.ForceReset ? 'ForceReset' : 'ResetRequired';
      const sysMessage = `Error during User Authentication: Account disabled for ${email}`;
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.failedToAuthenticate,
        userMessage,
        sysMessage
      );
    }

    if (new Date(authenticationResponse['custom:passwordUpdatedAt']) <= sixMonthsAgo) {
      await awsCognito.adminResetUserPassword(req, normalizedUsername);
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.failedToAuthenticate,
        'PasswordExpired',
        `Error during User Authentication: Password expired for ${email}`
      );
    }

    authenticatedInformation = authenticationResponse;
    const storedProcString = isProManagerLogin
      ? 'uspGetGFWProRootUserInfo'
      : 'uspGetInitialUserRouteInfo';
    const userRecords = await sqlUtils.executeSystemStoredProcedure(req, storedProcString, params);

    if (!userRecords.length) {
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userNotAdmin,
        langResources.getResourceString('loginFailed'),
        `UserEmail: ${username} is a user, but not found for the requested site`
      );
    }

    userRecord = userRecords[0];

    Object.assign(req.session, {
      user_id: userRecord.id,
      user_email: userRecord.user_email.toLocaleLowerCase(),
      ispromanager: isProManagerLogin,
      user_secret: userRecord.user_secret,
      access_token: authenticatedInformation.token,
      last_activity_time: new Date(),
    });

    authenticationPreference = userRecord.user_auth_preference_id;

    speakEasyToken = await speakEasy.createTotp(req, req.session.user_secret);

    const routeInfoRecords = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspGetVerifiedUserRouteInfo',
      params
    );

    if (
      routeInfoRecords.length === 1 &&
      routeInfoRecords[0].organization_status_id === orgAccountStatus.Inactive
    ) {
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userNotAdmin,
        langResources.getResourceString('loginFailed'),
        `UserEmail: ${username} is a user, but their organization is inactive`
      );
    }

    if (
      authenticatedInformation.authenticationStatus === AUTH_STATUS.Authenticated &&
      authenticationPreference === PLATFORM_VARS.authenticationPreference.Email
    ) {
      const subject = 'GFW Pro Verification Code';
      const content = { verification_code: speakEasyToken };
      const msg = awsSes.createBodyContent(
        req,
        PLATFORM_VARS.emailType.VERIFY_AUTHENTICATION,
        content,
        'success'
      );
      await awsSes.sendEmail(req, AWS_VARS.ses.sender, [req.session.user_email], subject, msg);
    }

    return authenticatedInformation;
  } catch (err) {
    logger.error('Error in login:', err);

    try {
      await awsCognito.resendTemporaryPassword(req, normalizedUsername, err);
      if (authenticatedInformation) {
        authenticatedInformation.authenticationStatus = AUTH_STATUS.ResendPassword;
      }
      return authenticatedInformation;
    } catch (resendErr) {
      logger.error('Error in login.awsCognito.getUserInfo catch:', resendErr);
      throw resendErr;
    }
  }
};

/**
 *   @function {setOrgSessions}
 *   @summary Call to set session variables for a user
 *   @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Object}   org - organization to set user session variables for
 *   @return {Promise} A promise object that returns true, otherwise error object
 */
export const setOrgSessions = async (req, org) => {
  Object.assign(req.session, {
    organization_id: parseInt(org.organization_id, 10),
    organization_name: org.organization_name,
    organization_database: org.organization_db,
    organization_user_id: parseInt(org.organization_user_id, 10),
    organization_status_id: parseInt(org.organization_status_id, 10),
    subscription_status_id: parseInt(org.subscription_status_id, 10),
  });

  if (!req.session.ispromanager) {
    const params = [{ field: 'userID', type: sql.Int, value: req.session.organization_user_id }];
    const [userInfo] = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetUserInfo',
      params
    );

    if (!userInfo) {
      const userMessage = langResources.getResourceString('authenticationFailure');
      const sysMessage = `CRITICAL ERROR: Obtaining user access level for ${req.session.user_email}`;
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userNotAdmin,
        userMessage,
        sysMessage
      );
    }

    Object.assign(req.session, {
      user_access_level_id: userInfo.access_level_id,
      user_first_name: userInfo.first_name,
      user_last_name: userInfo.last_name,
    });

    logger.logActivity(
      req,
      logger.listActivityTypes.User.UserLogin,
      `User ID ${req.session.organization_user_id} has logged in.`
    );
  }

  return true;
};

// unsafe variant of verifyLogin() for devtest use that bypasses Cognito
const unsafeDevOnlyVerify = async (req, user, secret) => {
  if (!isDevTestUser(user, secret)) {
    throw new Error('unsafeDevOnlyVerify only supported in dev mode');
  }

  // If the user is a Pro Manager, mark as verified
  if (req.session.ispromanager) {
    req.session.verified_promanager = true;
    return true; // Return early to avoid unnecessary database queries
  }

  // Get additional user info for normal users
  const params = [{ field: 'userEmail', type: sql.NVarChar(50), value: req.session.user_email }];
  const [userInfo] = await sqlUtils.executeSystemStoredProcedure(
    req,
    'uspGetVerifiedUserRouteInfo',
    params
  );

  // Set organization sessions and return the result
  return await setOrgSessions(req, userInfo);
};

/**
 *   @function {verifyLogin}
 *   @summary Verifies the login with two-step verification after initial authentication
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {String} userToken - The user's token input to be compared to the secret key
 *   @return {Promise} A promise object that returns true if verified otherwise an error object
 */
export const verifyLogin = async (req, userToken) => {
  // Short-circuit for test users
  if (isDevTestUser(req.session.user_email, userToken)) {
    return unsafeDevOnlyVerify(req, req.session.user_email, userToken);
  }

  // Check session validity
  if (!req.session.user_email) {
    const userMessage = langResources.getResourceString('invalidSession');
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAdmin,
      userMessage,
      userMessage
    );
  }

  // Verify TOTP token
  const validateResult = await speakEasy.validateToken(req, req.session.user_secret, userToken);
  if (!validateResult) {
    const userMessage = langResources.getResourceString('verificationFailed');
    const sysMessage = `UserEmail: ${req.session.user_email}   Verification Code: ${userToken}`;
    throw errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.userNotAdmin,
      userMessage,
      sysMessage
    );
  }

  // Reset Cognito failure count
  awsCognito.setLoginFailCount(0, req.session.user_email, USER_POOL_ID);

  // If the user is a regular user (not a pro manager), fetch additional info
  if (!req.session.ispromanager) {
    const params = [{ field: 'userEmail', type: sql.NVarChar(50), value: req.session.user_email }];
    const recordSets = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspGetVerifiedUserRouteInfo',
      params
    );

    if (!recordSets.length) {
      const userMessage = langResources.getResourceString('authenticationFailure');
      const sysMessage = `CRITICAL ERROR: Obtaining user info for ${req.session.user_email}`;
      throw errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userNotAdmin,
        userMessage,
        sysMessage
      );
    }

    if (recordSets.length === 1) {
      const organization = recordSets[0];
      if (organization.organization_status_id === orgAccountStatus.Inactive) {
        const userMessage = langResources.getResourceString('authenticationFailure');
        const sysMessage = `${organization.organization_name} is deactivated`;
        throw errorUtils.createErrorMessage(
          req,
          errorUtils.ERROR_CODES.userNotAdmin,
          userMessage,
          sysMessage
        );
      }

      // Set session for the active org
      await setOrgSessions(req, organization);
      return true;
    }

    // Multiple organizations — frontend should prompt user to select one
    return 'multiple';
  } else {
    req.session.verified_promanager = true;
    return true;
  }
};

/**
 *   @function {getOrganizations}
 *   @summary Call to get list of orgs a user is part of
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} A promise object that returns list of orgs, otherwise error object
 */
export const getOrganizations = async (req) => {
  try {
    const parameters = [
      { field: 'userEmail', type: sql.NVarChar(50), value: req.session.user_email },
    ];

    const recordSets = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspGetVerifiedUserRouteInfo',
      parameters
    );
    const activeOrganizations = recordSets.filter(
      (record) => record.organization_status_id !== orgAccountStatus.Inactive
    );

    return activeOrganizations;
  } catch (errorMsg) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetOrganizations,
      `Failed to get organizations for ${req.session.user_email}`,
      errorMsg
    );
    throw errorObject;
  }
};

/**
 *   @function {setInitialPassword}
 *   @summary Mandatory call to change password when User logs in for the first time
 *   @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String}  oldPassword - User's old password
 *   @param  {String}  newPassword - User's new password
 *   @return {Promise} A promise object that returns true password changed, otherwise error object
 */
export const setInitialPassword = async (req, oldPassword, newPassword) => {
  try {
    await awsCognito.completeNewPasswordChallenge(req, oldPassword, newPassword);
    return true;
  } catch (errorMsg) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToSetPassword,
      'Failed to set initial password',
      errorMsg
    );
    throw errorObject; // Throw error to be caught by calling code
  }
};

/**
 *   @function {requestPasswordReset}
 *   @summary Request reset of the password for a user who has forgotten their password.
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {String} userEmail - User's email/username
 *   @return {Promise} A promise object that returns true if successful, otherwise error object
 */
export const requestPasswordReset = async (req, userEmail) => {
  try {
    const normalizedUsername = userEmail.toLocaleLowerCase();

    // Check if user exists
    const checkUserEmailParameters = [
      { field: 'email', type: sql.NVarChar(50), value: normalizedUsername },
    ];

    const recordSets = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspCheckUserEmail',
      checkUserEmailParameters
    );

    if (!recordSets.length) {
      const userMessage = langResources.getResourceString('invalidEmail');
      const sysMessage = `CRITICAL ERROR: User not found - ${normalizedUsername}`;
      errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userNotFound,
        userMessage,
        sysMessage
      );
      throw new Error('User does not exist');
    }

    // Cognito reset password request
    const result = await awsCognito.requestToResetPassword(req, normalizedUsername);

    return result || true; // Return the result or default to true if undefined
  } catch (err) {
    console.log(err);
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToSetPassword,
      'Failed to Request Password Reset',
      err
    );
    throw errorObject;
  }
};

export const adminResetUserPassword = async (req, user_email) => {
  try {
    const checkUserEmailParameters = [
      { field: 'email', type: sql.NVarChar(50), value: user_email },
    ];

    const recordSets = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspCheckUserEmail',
      checkUserEmailParameters
    );

    if (!recordSets.length) {
      const userMessage = langResources.getResourceString('invalidEmail');
      const sysMessage = `CRITICAL ERROR: User not found - ${user_email}`;
      errorUtils.createErrorMessage(
        req,
        errorUtils.ERROR_CODES.userNotFound,
        userMessage,
        sysMessage
      );
      throw new Error('User does not exist');
    }

    // Perform the Cognito password reset
    await awsCognito.adminResetUserPassword(req, user_email);

    return true;
  } catch (err) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToSetPassword,
      'Admin Failed to Request Password Reset',
      err
    );
    throw errorObject;
  }
};

/**
 *   @function {confirmPasswordReset}
 *   @summary Confirmation of new password for forgotten password workflow
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param {String} verification_code - Code required to reset password
 *   @param {String} new_password - The proposed new password
 *   @param {String} user_email - User's email/username
 *   @return {Promise} A promise object that returns true if successful, otherwise error object
 */
export const confirmPasswordReset = async (req, verification_code, new_password, user_email) => {
  const normalizedUsername = user_email.toLocaleLowerCase();

  try {
    const result = await awsCognito.confirmForgotPassword(
      req,
      verification_code,
      new_password,
      normalizedUsername
    );
    await awsCognito.resetLoginAttributes(normalizedUsername, USER_POOL_ID);
    return result;
  } catch (errorMsg) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToSetPassword,
      'Failed to confirm password reset',
      errorMsg
    );
    throw errorObject;
  }
};

/**
 *   @function {changePassword}
 *   @summary Change password of a signed in User
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String} previousPassword - User's old password
 *   @param  {String} proposedPassword - User's new password
 *   @return {Promise} A promise object that returns true if successful, otherwise error object
 */
export const changePassword = async (req, previousPassword, proposedPassword) => {
  try {
    await awsCognito.changePassword(req, previousPassword, proposedPassword);
    return true;
  } catch (errorMsg) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToSetPassword,
      'Failed to change password:',
      errorMsg
    );
    throw errorObject;
  }
};

/**
 *   @function {getUserInfo}
 *   @summary Obtains the user information for the current user.
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Object} JSON object providing the user info.
 */
export const getUserInfo = (req) => {
  return new Promise((resolve, reject) => {
    // Retrieve organization user information and System Auth pref information
    const organizationParameters = [
      { field: 'userID', type: sql.Int, value: req.session.organization_user_id },
    ];
    const systemParameters = [
      { field: 'organization_id', type: sql.Int, value: req.session.organization_id },
      { field: 'user_email', type: sql.NVarChar(150), value: req.session.user_email },
    ];
    Promise.all([
      sqlUtils.executeOrganizationStoredProcedure(req, 'uspGetUserInfo', organizationParameters),
      sqlUtils.executeSystemStoredProcedure(
        req,
        'uspGetUserAuthenticationPreferences',
        systemParameters
      ),
    ])
      .then((results) => {
        const [organizationResults, systemResults] = results;
        const [userInfo] = organizationResults;
        const [authenticationPreference] = systemResults;
        const information = Object.assign(userInfo, authenticationPreference);
        resolve(information);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.ERROR_CODES.failedToGetUserInfo,
          'Failed to get user info',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 *   @function {getUserOrganizationStatus}
 *   @summary Obtains the user information for the current user.
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} JSON object providing the user info.
 */
export const getUserOrganizationStatus = async (req) => {
  try {
    const { organization_user_id } = req.session;
    const parameters = [{ field: 'user_id', type: sql.Int, value: organization_user_id }];

    const recordSets = await sqlUtils.executeOrganizationStoredProcedure(
      req,
      'uspGetUserStatus',
      parameters
    );
    const { status_id } = recordSets[0];

    return status_id;
  } catch (errorMsg) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToGetUserInfo,
      'Failed to get user status:',
      errorMsg
    );
    throw errorObject;
  }
};

/**
 *   @function {getOrganizationStatus}
 *   @summary Retrieves the organization status ID for the current session's organization.
 *   @param  {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} A Promise that resolves with the organization status ID, or rejects with a formatted error object.
 */
export const getOrganizationStatus = async (req) => {
  const { organization_id } = req.session;
  const parameters = [{ field: 'organizationId', type: sql.Int, value: organization_id }];

  try {
    const recordSets = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspGetOrganizationStatus',
      parameters
    );
    const [record] = recordSets;
    return record.organization_status_id;
  } catch (errorMsg) {
    throw errorUtils.createErrorMessage(req, 'Failed to get organization status:', errorMsg);
  }
};

/**
 *   @function {resendVerifyToken}
 *   @summary Re-sends two-step verification code
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} A promise object that returns true if successful, otherwise error object
 */
export const resendVerifyToken = async (req) => {
  try {
    const verificationCode = await speakEasy.createTotp(req, req.session.user_secret);

    const subject = 'Resend: GFW Pro Session Token';
    const content = { verification_code: verificationCode };
    const msg = awsSes.createBodyContent(
      req,
      PLATFORM_VARS.emailType.VERIFY_AUTHENTICATION,
      content,
      'success'
    );

    await awsSes.sendEmail(req, AWS_VARS.ses.sender, [req.session.user_email], subject, msg);

    return true; // Return success after sending email
  } catch (errorMsg) {
    const errorObject = errorUtils.createErrorMessage(
      req,
      errorUtils.ERROR_CODES.failedToResendVerifyToken,
      'Could not resend verify token',
      errorMsg
    );
    throw errorObject;
  }
};

/** @function {logout}
 *   @summary Removes all session variables, effectively logging out the user
 *   @param  {Object}   req - Mandatory first parameter to pass the request object into the function in case session info is required.
 */
export const logout = (req) => {
  const { ispromanager, organization_user_id } = req.session;

  // Log activity if user is not a Pro Manager
  if (!ispromanager) {
    // Logging is async but won't block session destruction
    logger.logActivity(
      req,
      logger.listActivityTypes.User.UserLogout,
      `User ID ${organization_user_id} has logged out.`
    );
  }

  // Delete session variables immediately
  req.session.destroy();
};

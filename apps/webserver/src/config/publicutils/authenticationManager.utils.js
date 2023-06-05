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
 *   req.session.ogranization_name
 *   req.session.user_access_level_id
 *   req.session.organization_status_id
 *   req.session.user_first_name
 *   req.session.user_last_name
 *
 ******************************************************************* */
// Imports required for this module
const path = require('path');
const sql = require('mssql');
const config = require('../config');

const langResources = require(path.resolve('./config/langResources'));
const AWSSES = require(path.resolve('./config/privateutils/ses.utils'));
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));
const errorUtils = require(path.resolve('./config/privateutils/error.utils'));
const AWSCognito = require(path.resolve('./config/privateutils/cognito.utils'));
const SpeakEasy = require(path.resolve('./config/privateutils/speakeasy.utils'));
const logger = require(path.resolve('./config/privateutils/logger.utils'));

/**
 * Return true only if the given user and secret are for devtest use and
 *  current environment is for devtest as well
 * @param {String} email - username
 * @param {String} secret - secret value
 * @returns {boolean}
 */
const isDevTestUser = (email, secret) => {
  return (
    email.startsWith('dt_') &&
    secret === 'unsafe' &&
    (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
  );
};

// unsafe variant of login() for devtest use that bypasses Cognito
const unsafeDevOnlyLogin = async (req, username, secret, promanagerLogin) => {
  if (!isDevTestUser(username, secret)) {
    throw new Error('unsafeDevOnlyLogin only supported in devtest mode for devtest users');
  }
  const normalizeUsername = username.toLocaleLowerCase();
  const params = [{ field: 'userEmail', type: sql.NVarChar(50), value: normalizeUsername }];
  let recordsets;
  if (promanagerLogin) {
    recordsets = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspGetGFWProRootUserInfo',
      params
    );
  } else {
    recordsets = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspGetInitialUserRouteInfo',
      params
    );
  }
  const [userRecord] = recordsets;
  if (!userRecord) {
    throw new Error('UnsafeDevUser not in DB');
  }
  req.session.user_email = username;
  req.session.ispromanager = promanagerLogin;
  req.session.user_secret = userRecord.user_secret;
  req.session.access_token = 'SecretAccessToken';
  req.session.last_activity_time = new Date();
  return { authenticationStatus: 1 };
};

/**
 * @function login
 * @summary Performs the initial login sequence.
 * @param {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 * @param {String} username - username of the user.
 * @param {String} password - password of the user.
 * @param {Boolean} promanager_login - A boolean to determine whether the
 *                 user is logging into pro-manager or the main platform.
 * @return {Promise} A promise object that returns an object with
 *                   authentication info if resolved, otherwise returns an
 *                   error object.
 */
const login = async (req, username, password, promanager_login = false) => {
  if (isDevTestUser(username, password)) {
    return unsafeDevOnlyLogin(req, username, password, promanager_login);
  }

  return new Promise((resolve, reject) => {
    const normalizeUsername = username.toLocaleLowerCase();
    // Declare vars
    let authenticationPreference = config.platformVars.authenticationPreference.Email;
    let authenticatedInformation = {};
    let speakEasyToken;
    let userRecord;

    // Authenticate user with AWS Cognito Pool
    AWSCognito.getUserInfo(normalizeUsername, config.AWSVars.cognito.userpoolId)
      .then(async (userInfo) => {
        return AWSCognito.authenticateUser(req, normalizeUsername, password, userInfo);
      })
      .then(async (authenticationResponse) => {
        const currentDate = new Date();
        const { authenticationStatus, email } = authenticationResponse;

        currentDate.setMonth(currentDate.getMonth() - 6);
        const newDate = currentDate.toUTCString();
        // If the user is unauthenticated, disabled, or requires password confirmation - throw error
        if (
          authenticationStatus === config.platformVars.authenticationStatus.Unauthenticated ||
          authenticationStatus === config.platformVars.authenticationStatus.Disabled ||
          authenticationStatus === config.platformVars.authenticationStatus.ConfirmPassword
        ) {
          const userMessage = langResources.getResourceString('loginFailed');
          const sysMessage = `UserEmail: ${email}   Authentication Status: ${authenticationStatus}`;
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userNotAdmin,
            userMessage,
            sysMessage
          );
        } else if (
          authenticationStatus === config.platformVars.authenticationStatus.ResetRequired
        ) {
          const userMessage = 'ResetRequired';
          const sysMessage = [`Error User Authentication: Account disabled for ${email}`];
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToAuthenticate,
            userMessage,
            sysMessage
          );
          // }
        } else if (authenticationStatus === config.platformVars.authenticationStatus.ForceReset) {
          const userMessage = 'ForceReset';
          const sysMessage = [`Error User Authentication: Account disabled for ${email}`];
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToAuthenticate,
            userMessage,
            sysMessage
          );
        } else if (
          new Date(authenticationResponse['custom:passwordUpdatedAt']) <= new Date(newDate)
        ) {
          await AWSCognito.adminResetUserPassword(req, normalizeUsername);
          const userMessage = 'PasswordExpired';
          const sysMessage = [`Error User Authentication: Password expired for ${email}`];
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToAuthenticate,
            userMessage,
            sysMessage
          );
        }
        // Save information
        authenticatedInformation = authenticationResponse;
        // Depending on login type (pro-manager or normal user - retrieve user information)
        const params = [{ field: 'userEmail', type: sql.NVarChar(50), value: normalizeUsername }];
        if (promanager_login) {
          return sqlUtils.executeSystemStoredProcedure(req, 'uspGetGFWProRootUserInfo', params);
        }
        return sqlUtils.executeSystemStoredProcedure(req, 'uspGetInitialUserRouteInfo', params);
      })
      .then((recordsets) => {
        // If zero records - user exists via Cognito but not within the database - TODO handle this case appropriately
        if (recordsets.length === 0) {
          const userMessage = langResources.getResourceString('loginFailed');
          const sysMessage = `UserEmail: ${username} is a user, but not found for the requested site`;
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userNotAdmin,
            userMessage,
            sysMessage
          );
        } else {
          // If there is a record, set the session variables
          [userRecord] = recordsets;
          // Set User Email.
          req.session.user_email = userRecord.user_email;
          // Set Pro Manager Session.
          req.session.ispromanager = promanager_login;
          // Set the user secret session variables.
          req.session.user_secret = userRecord.user_secret;
          // Set Cognito JWT Token to session variables
          req.session.access_token = authenticatedInformation.token;
          // set last activity time to track inactivity
          req.session.last_activity_time = new Date();
          // Set authentication preference
          authenticationPreference = userRecord.user_auth_preference_id;
          // Create their TOTP token to fulfill 2nd step authentication
          return SpeakEasy.createTotp(req, req.session.user_secret);
        }
      })
      .then((token) => {
        speakEasyToken = token;
        const parameters = [
          { field: 'userEmail', type: sql.NVarChar(50), value: userRecord.user_email },
        ];
        return sqlUtils.executeSystemStoredProcedure(
          req,
          'uspGetVerifiedUserRouteInfo',
          parameters
        );
      })
      .then((recordsets) => {
        if (recordsets.length === 1) {
          const [routeInfo] = recordsets;
          const { organization_status_id } = routeInfo;
          if (organization_status_id === config.platformVars.status.Inactive) {
            const userMessage = langResources.getResourceString('loginFailed');
            const sysMessage = `UserEmail: ${username} is a user, but not found for the requested site`;
            throw new errorUtils.createErrorMessage(
              req,
              errorUtils.errorCodes.userNotAdmin,
              userMessage,
              sysMessage
            );
          }
        }

        if (
          authenticatedInformation.authenticationStatus ===
          config.platformVars.authenticationStatus.Authenticated
        ) {
          // Send the Verification Email if it is the user's preference
          if (authenticationPreference === config.platformVars.authenticationPreference.Email) {
            const subject = 'GFW Pro Verification Code';
            const content = { verification_code: speakEasyToken };
            const msg = AWSSES.createBodyContent(
              req,
              config.platformVars.emailType.VERIFY_AUTHENTICATION,
              content,
              'success'
            );
            return AWSSES.sendEmail(
              req,
              config.AWSVars.ses.sender,
              [req.session.user_email],
              subject,
              msg
            );
          }
        }
      })
      .then(() => {
        resolve(authenticatedInformation);
      })
      .catch((err) => {
        // Check if a temporary password needs to be sent
        AWSCognito.resendTemporaryPassword(req, normalizeUsername, err)
          .then(() => {
            authenticatedInformation.authenticationStatus =
              config.platformVars.authenticationStatus.ResendPassword;
            resolve(authenticatedInformation);
          })
          .catch((resendTemporaryPasswordErr) => {
            reject(resendTemporaryPasswordErr);
          });
      });
  });
};

/**
 *   @function {setOrgSessions}
 *   @summary Call to set session variables for a user
 *   @param  {Object}  req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {Object}   org - organization to set user session variables for
 *   @return {Promise} A promise object that returns true, otherwise error object
 */
const setOrgSessions = (req, org) => {
  return new Promise((resolve, reject) => {
    // Save Org ID Info.
    req.session.organization_id = parseInt(org.organization_id, 10);
    // Organization Name
    req.session.organization_name = org.organization_name;
    // Save Org DB Info.
    req.session.organization_database = org.organization_db;
    // Save Organization User ID.
    req.session.organization_user_id = parseInt(org.organization_user_id, 10);
    // Save Organization Status ID.
    req.session.organization_status_id = parseInt(org.organization_status_id, 10);
    // Save Organization Subscription Status ID.
    req.session.subscription_status_id = parseInt(org.subscription_status_id, 10);
    // Call Organization Db to get additional User Information.
    const params = [{ field: 'userID', type: sql.Int, value: req.session.organization_user_id }];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetUserInfo', params)
      .then((recordsets) => {
        // Obtain Access Level for regular user.
        if (req.session.ispromanager === false) {
          // If a record is not availabe, something went wrong because this should have been confirmed in the initial login step.
          if (recordsets.length === 0) {
            const userMessage = langResources.getResourceString('AuthenticationFailure');
            const sysMessage = `CRITICAL ERROR: Obtaining user access level for ${req.session.user_email}`;
            throw new errorUtils.createErrorMessage(
              req,
              errorUtils.errorCodes.userNotAdmin,
              userMessage,
              sysMessage
            );
          } else {
            // Set User Access Level.
            req.session.user_access_level_id = recordsets[0].access_level_id;
            // Set User First & Last Name
            req.session.user_first_name = recordsets[0].first_name;
            req.session.user_last_name = recordsets[0].last_name;
            if (req.session.ispromanager === false) {
              logger.logActivity(
                req,
                logger.listActivityTypes.User.UserLogin,
                `User ${req.session.user_first_name} ${req.session.user_last_name} has logged in.`
              );
            }
            resolve(true);
          }
        }
      })
      .catch((errorMessage) => {
        reject(errorMessage);
      });
  });
};

// unsafe variant of verifyLogin() for devtest use that bypasses Cognito
const unsafeDevOnlyVerify = async (req, user, secret) => {
  if (!isDevTestUser(user, secret)) {
    throw new Error('unsafeDevOnlyVerify only supported in dev mode');
  }
  // If the user is logging in as a normal user, obtain additional Information to set for the session.
  if (req.session.ispromanager === true) {
    req.session.verified_promanager = true;
  } else {
    const params = [{ field: 'userEmail', type: sql.NVarChar(50), value: req.session.user_email }];
    const recordsets = await sqlUtils.executeSystemStoredProcedure(
      req,
      'uspGetVerifiedUserRouteInfo',
      params
    );
    const retval = await setOrgSessions(req, recordsets[0]);
    return retval;
  }
};

/**
 *   @function {verifyLogin}
 *   @summary Verifies the login with two-step verification after initial authentication
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {String} userToken - The user's token input to be compared to the secret key
 *   @return {Promise} A promise object that returns true if verified otherwise and error object
 */
const verifyLogin = (req, userToken) => {
  if (isDevTestUser(req.session.user_email, userToken)) {
    return unsafeDevOnlyVerify(req, req.session.user_email, userToken);
  }

  return new Promise((resolve, reject) => {
    // Check to make sure this is a valid session with initial login verified.
    if (req.session.user_email === undefined) {
      const userMessage = langResources.getResourceString('InvalidSession');
      throw new errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotAdmin,
        userMessage,
        userMessage
      );
    }
    // Verify Token.
    SpeakEasy.validateToken(req, req.session.user_secret, userToken)
      .then((validateResult) => {
        // If a user has not been verified through the secondary token, throw an error.
        if (validateResult === false) {
          const userMessage = langResources.getResourceString('verificationFailed');
          const sysMessage = `UserEmail: ${req.session.user_email}   Verification Code: ${userToken}`;
          throw new errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userNotAdmin,
            userMessage,
            sysMessage
          );
        }
        // Reset the Cognito failure count
        AWSCognito.setLoginFailCount(0, req.session.user_email, config.AWSVars.cognito.userpoolId);

        // If the user is logging in as a normal user, obtain additional Information to set for the session.
        if (req.session.ispromanager === false) {
          // Setup Parameters to pass to get User Info.
          const params = [
            { field: 'userEmail', type: sql.NVarChar(50), value: req.session.user_email },
          ];
          // Get Information on User from Platform Db.
          return sqlUtils.executeSystemStoredProcedure(req, 'uspGetVerifiedUserRouteInfo', params);
        }
      })
      .then((recordsets) => {
        // For a regular user, we need to collect additional information.
        if (req.session.ispromanager === false) {
          // If a record is not availabe, something went wrong because this should have been confirmed in the initial login step.
          if (recordsets.length === 0) {
            const userMessage = langResources.getResourceString('AuthenticationFailure');
            const sysMessage = `CRITICAL ERROR: Obtaining user info for ${req.session.user_email}`;
            throw new errorUtils.createErrorMessage(
              req,
              errorUtils.errorCodes.userNotAdmin,
              userMessage,
              sysMessage
            );
            // If the user only has ONE organization then proceed to regular verification
          } else if (recordsets.length === 1) {
            // Determine if the only organization is DEACTIVATED
            const organization = recordsets[0];
            if (organization.organization_status_id === config.platformVars.status.Inactive) {
              const userMessage = langResources.getResourceString('AuthenticationFailure');
              const sysMessage = `${organization.organization_name} is deactivated`;
              throw new errorUtils.createErrorMessage(
                req,
                errorUtils.errorCodes.userNotAdmin,
                userMessage,
                sysMessage
              );
            } else {
              return setOrgSessions(req, recordsets[0]);
            }
            // If the user has more than one organization then they should be able to select one from a list.
          } else {
            return 'multiple';
          }
        } else {
          req.session.verified_promanager = true;
        }
      })
      .then((result) => {
        resolve(result);
      })
      .catch((errorMessage) => {
        reject(errorMessage);
      });
  });
};

/**
 *   @function {getOrganizations}
 *   @summary Call to get list of orgs a user is part of
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} A promise object that returns list of orgs, otherwise error object
 */
const getOrganizations = (req) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'userEmail', type: sql.NVarChar(50), value: req.session.user_email },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspGetVerifiedUserRouteInfo', parameters)
      .then((recordsets) => {
        const activeOrganizations = recordsets.filter(
          (record) => record.organization_status_id !== config.platformVars.status.Inactive
        );
        resolve(activeOrganizations);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetOrganizations,
          `Failed to get organizations for ${req.session.user_email}`,
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 *   @function {setInitialPassword}
 *   @summary Mandatory call to change password when User logs in for the first time
 *   @param  {Object}  req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String}  old_password - User's old password
 *   @param  {String}  new_password - User's new password
 *   @return {Promise} A promise object that returns true password changed, otherwise error object
 */
const setInitialPassword = (req, old_password, new_password) => {
  return new Promise((resolve, reject) => {
    // Get User Info and complete the new password challenge
    AWSCognito.completeNewPasswordChallenge(req, old_password, new_password)
      .then(() => {
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToSetPassword,
          'Failed to set initial password',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 *   @function {requestPasswordReset}
 *   @summary Request reset of the password for a user who has forgotten their password.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {String} user_email - User's email/username
 *   @return {Promise} A promise object that returns true if successful, otherwise error object
 */
const requestPasswordReset = (req, user_email) => {
  return new Promise((resolve, reject) => {
    const checkUserEmailParameters = [
      { field: 'email', type: sql.NVarChar(50), value: user_email },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspCheckUserEmail', checkUserEmailParameters)
      .then((recordsets) => {
        if (recordsets.length === 0) {
          const userMessage = langResources.getResourceString('invalidEmail');
          const sysMessage = `CRITICAL ERROR: User not found - ${user_email}`;
          errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userNotFound,
            userMessage,
            sysMessage
          );
          throw new Error('User does not exist');
        }
        // Cognito reset password
        return AWSCognito.requestToResetPassword(req, user_email);
      })
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          resolve(true);
        }
      })
      .catch((err) => {
        console.log(err);
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToSetPassword,
          'Failed to Request Password Reset',
          err
        );
        reject(errorObject);
      });
  });
};

const adminResetUserPassword = (req, user_email) => {
  return new Promise((resolve, reject) => {
    const checkUserEmailParameters = [
      { field: 'email', type: sql.NVarChar(50), value: user_email },
    ];
    sqlUtils
      .executeSystemStoredProcedure(req, 'uspCheckUserEmail', checkUserEmailParameters)
      .then((recordsets) => {
        if (recordsets.length === 0) {
          const userMessage = langResources.getResourceString('invalidEmail');
          const sysMessage = `CRITICAL ERROR: User not found - ${user_email}`;
          errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userNotFound,
            userMessage,
            sysMessage
          );
          throw new Error('User does not exist');
        }
        // Cognito reset password
        return AWSCognito.adminResetUserPassword(req, user_email);
      })
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToSetPassword,
          'Admin Failed to Request Password Reset',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 *   @function {confirmPasswordReset}
 *   @summary Confirmation of new password for forgetten password workflow
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param {String} verification_code - Code required to reset password
 *   @param {String} new_password - The proposed new password
 *   @param {String} user_email - User's email/username
 *   @return {Promise} A promise object that returns true if successful, otherwise error object
 */
const confirmPasswordReset = async (req, verification_code, new_password, user_email) => {
  return new Promise((resolve, reject) => {
    AWSCognito.confirmForgotPassword(req, verification_code, new_password, user_email)
      .then((result) => {
        AWSCognito.resetLoginAttributes(user_email, config.AWSVars.cognito.userpoolId)
          .then(() => {
            resolve(result);
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToSetPassword,
          'Failed to confirm password reset',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 *   @function {changePassword}
 *   @summary Change password of a signed in User
 *   @param  {Object} req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @param  {String} previousPassword - User's old password
 *   @param  {String} proposedPassword - User's new password
 *   @return {Promise} A promise object that returns true if successful, otherwise error object
 */
const changePassword = (req, previousPassword, proposedPassword) => {
  return new Promise((resolve, reject) => {
    AWSCognito.changePassword(req, previousPassword, proposedPassword)
      .then(() => {
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToSetPassword,
          'Failed to change password',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/**
 *   @function {getUserInfo}
 *   @summary Obtains the user information for the current user.
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Object} JSON object providing the user info.
 */
const getUserInfo = (req) => {
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
          errorUtils.errorCodes.failedToGetUserInfo,
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
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Object} JSON object providing the user info.
 */
const getUserOrganizationStatus = (req) => {
  return new Promise((resolve, reject) => {
    const parameters = [
      { field: 'user_id', type: sql.Int, value: req.session.organization_user_id },
    ];
    sqlUtils
      .executeOrganizationStoredProcedure(req, 'uspGetUserStatus', parameters)
      .then((recordsets) => {
        const [record] = recordsets;
        const { status_id } = record;
        resolve(status_id);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToGetUserInfo,
          'Failed to get user status',
          err
        );
        reject(errorObject);
      });
  });
};

const getOrganizationStatus = (request) => {
  return new Promise((resolve, reject) => {
    const { organization_id } = request.session;
    const parameters = [{ field: 'organizationId', type: sql.Int, value: organization_id }];
    sqlUtils
      .executeSystemStoredProcedure(request, 'uspGetOrganizationStatus', parameters)
      .then((recordsets) => {
        const [record] = recordsets;
        const { organization_status_id } = record;
        resolve(organization_status_id);
      })
      .catch((err) => {
        const errorObject = errorUtils.createErrorMessage(
          request,
          'Failed to get organization status',
          err
        );
        reject(errorObject);
      });
  });
};

/**
 *   @function {resendVerifyToken}
 *   @summary Resends two-step verification code
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {Promise} A promise object that returns true if successful, otherwise error object
 */
const resendVerifyToken = (req) => {
  return new Promise((resolve, reject) => {
    SpeakEasy.createTotp(req, req.session.user_secret)
      .then((verificationCode) => {
        const subject = 'Resend: GFW Pro Session Token';
        const content = { verification_code: verificationCode };
        const msg = AWSSES.createBodyContent(
          req,
          config.platformVars.emailType.VERIFY_AUTHENTICATION,
          content,
          'success'
        );
        return AWSSES.sendEmail(
          req,
          config.AWSVars.ses.sender,
          [req.session.user_email],
          subject,
          msg
        );
      })
      .then(() => {
        resolve(true);
      })
      .catch((errorMessage) => {
        const errorObject = errorUtils.createErrorMessage(
          req,
          errorUtils.errorCodes.failedToResendVerifyToken,
          'Could not resend verify token',
          errorMessage
        );
        reject(errorObject);
      });
  });
};

/** @function {logout}
 *   @summary Removes all session variables, effectively logging out the user
 *   @param  {Object}   req - Manadatory first parameter to pass the request object into the function in case session info is required.
 *   @return {None} No returns
 */
const logout = (req) => {
  if (req.session.ispromanager === false) {
    logger
      .logActivity(
        req,
        logger.listActivityTypes.User.UserLogout,
        `User ${req.session.user_first_name} ${req.session.user_last_name} has logged out.`
      )
      .finally(() => {
        // Delete session variables
        req.session.destroy();
      });
  } else {
    // Delete session variables
    req.session.destroy();
  }
};

module.exports = {
  login,
  verifyLogin,
  setOrgSessions,
  getOrganizations,
  logout,
  getUserInfo,
  setInitialPassword,
  changePassword,
  requestPasswordReset,
  resendVerifyToken,
  confirmPasswordReset,
  adminResetUserPassword,
  getUserOrganizationStatus,
  getOrganizationStatus,
};

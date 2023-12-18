/** ******************************************************************
 *   @name: cognito.utils.js
 *   @description : A utility file to allow calling various
 *                 functionality from Cognito to signup and
 *                 authenticate users.
 *
 *   @function {authenticateUser}
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
// Imports for this module.
const path = require('path');
const { CognitoIdentityProvider } = require('@aws-sdk/client-cognito-identity-provider');
const PasswordGenerator = require('generate-password');
const AWSCognito = require('amazon-cognito-identity-js');

const config = require('../config');
const langResources = require(path.resolve('./config/langResources'));
const errorUtils = require('./error.utils');
const logger = require('./logger.utils');

// Local variable for Cognito Service Provider.
let cognitoIdentityServiceProvider;

/**
 * @function getUserInfo
 * @summary Gets all user info including custom attributes from Cognito
 * @param {String} email - The user email address
 * @param {String} USER_POOL_ID - The Cognito user pool id for that environment
 */
const getUserInfo = async (email, USER_POOL_ID) => {
  return cognitoIdentityServiceProvider.adminGetUser({
    UserPoolId: USER_POOL_ID,
    Username: email,
  });
};

/**
 * @function resetLoginAttributes
 * @summary Resets the Cognito login attributes for the user
 * @param {String} email - The user email address
 * @param {String} USER_POOL_ID - The Cognito user pool id for that environment
 */
const resetLoginAttributes = async (email, USER_POOL_ID) => {
  let returnValue;
  const params = {
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
    UserPoolId: USER_POOL_ID,
    Username: email,
  };

  try {
    returnValue = cognitoIdentityServiceProvider.adminUpdateUserAttributes(params);
  } catch (error) {
    console.log('ERROR: could not update user attributes!');
  }
  return returnValue;
};

/**
 * @function setLoginFailCount
 * @summary This sets the Cognito fail count whenever the user fails to login or resets its password.
 * @param {Number} failureCount - The number of fail counts for that particular user
 * @param {String} email - The user email address
 * @param {String} USER_POOL_ID - The Cognito user pool id for that environment
 */
const setLoginFailCount = async (failureCount, email, USER_POOL_ID) => {
  let returnValue;
  const params = {
    UserAttributes: [
      {
        Name: 'custom:fail_count',
        Value: failureCount.toString(),
      },
    ],
    UserPoolId: USER_POOL_ID,
    Username: email,
  };

  try {
    returnValue = cognitoIdentityServiceProvider.adminUpdateUserAttributes(params);
  } catch (error) {
    console.log('ERROR: could not update user attributes!');
  }
  return returnValue;
};

/**
 * @function handleUserOpeningPasswordDate
 * @summary Sets passwordUpdatedAt attribute in Cognito to the date passed in the function
 * @param {Date} updatedAt - The date that the Cognito passwordUpdatedAt attribute will be updated to
 * @param {String} email - The user email address
 * @param {String} USER_POOL_ID - The Cognito user pool id for that environment
 */
const handleUserOpeningPasswordDate = async (updatedAt, email, USER_POOL_ID) => {
  let returnValue;
  const params = {
    UserAttributes: [
      {
        Name: 'custom:passwordUpdatedAt',
        Value: updatedAt.toUTCString(),
      },
    ],
    UserPoolId: USER_POOL_ID,
    Username: email,
  };

  try {
    returnValue = cognitoIdentityServiceProvider.adminUpdateUserAttributes(params);
  } catch (error) {
    console.log('ERROR: could not update user attributes!');
  }
  return returnValue;
};

/**
 * @function disableUserBasedOnFailCounts
 * @summary Sets the user to RESET_REQUIRED status in Cognito
 * @param {String} email - The user email address
 * @param {String} USER_POOL_ID - The Cognito user pool id for that environment
 */
const disableUserBasedOnFailCounts = async (email, USER_POOL_ID) => {
  let returnValue;
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: email,
  };

  try {
    returnValue = cognitoIdentityServiceProvider.adminResetUserPassword(params);
  } catch (e) {
    console.log('error', e);
  }
  return returnValue;
};

/**
 *  @function confirmUserEmail
 *  @summary Admin Cognito action to update verified email state
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} username - Cognito Username
 *  @return {Promise} Returns a promise detailing success or failure of confirmUserEmail
 */
const confirmUserEmail = (req, username) => {
  return new Promise((resolve, reject) => {
    const parameters = {
      UserAttributes: [{ Name: 'email_verified', Value: 'True' }],
      UserPoolId: config.AWSVars.cognito.userpoolId,
      Username: username,
    };

    cognitoIdentityServiceProvider.adminUpdateUserAttributes(parameters, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 *  @function createUser
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @summary Create a new user in the identity pool provided.
 *  @param {String} email - The username of the cognito user (should be there email)
 *  @param {boolean} resend_temp_password - In case a temporary password needs to be send back to the user
 *  @return {Promise} Returns a promise detailing success or failure of createUser
 */
const createUser = (req, email, resend_temp_password = false, unit_test = false) => {
  return new Promise((resolve, reject) => {
    // Generate Random Password for new user.
    const randomPassword = PasswordGenerator.generate({
      length: 10,
      numbers: true,
      symbols: false,
      uppercase: true,
      strict: true,
      exclude: '#%&^"',
    });

    // Setup Cognito Parameters to create a new user.
    const params = {
      UserPoolId: config.AWSVars.cognito.userpoolId /* required */,
      Username: email /* required */,
      DesiredDeliveryMediums: ['EMAIL'],
      ForceAliasCreation: false,
      TemporaryPassword: randomPassword,
      UserAttributes: [{ Name: 'email', Value: email }],
      MessageAction: undefined,
    };

    // In case we need to send a temporary password to the user
    if (resend_temp_password) {
      params.MessageAction = 'RESEND';
    }

    cognitoIdentityServiceProvider.adminCreateUser(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // After successfully creating a new user - confirm the email_verified state
        confirmUserEmail(req, email).then((result) => {
          if (unit_test) {
            const testResult = {
              password: randomPassword,
              result: result,
            };
            resolve(testResult);
          } else {
            resolve(result);
          }
        });
      }
    });
  });
};

/**
 *  @function changePassword
 *  @summary Change password for an authenticated user
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} previousPassword
 *  @param {String} proposedPassword
 *  @return {Promise} Returns a promise detailing success or failure of changePassword
 */
const changePassword = (req, previousPassword, proposedPassword) => {
  return new Promise((resolve, reject) => {
    const parameters = {
      AccessToken: req.session.access_token,
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword,
    };

    cognitoIdentityServiceProvider.changePassword(parameters, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 *  @function deleteUser
 *  @summary Admin function to deleteUser from AWS Cognito
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - The username of the cognito user (should be there email)
 *  @return {Promise} Returns a promise detailing success or failure of deleteUser
 */
const deleteUser = (req, email) => {
  return new Promise((resolve, reject) => {
    const params = {
      UserPoolId: config.AWSVars.cognito.userpoolId,
      Username: email,
    };

    cognitoIdentityServiceProvider.adminDeleteUser(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 *  @function handleLoginFailure
 *  @summary Handles login failure, and if the fail count is >= config.platformVars.maxUserLoginRetries, disable the user by forcing it to the RESET_REQUIRED state in Cognito
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - The username of the cognito user (should be there email)
 *  @return {Promise} Returns a promise detailing success or failure of disableUser
 */
const handleLoginFailure = async (req, email) => {
  let userInfo;
  try {
    userInfo = await getUserInfo(email, config.AWSVars.cognito.userpoolId);
  } catch (error) {
    console.log('Error: ', error);
    throw error;
  }
  const userFailCount = userInfo.UserAttributes.find(
    (userAttribute) => userAttribute.Name === 'custom:fail_count'
  );
  let failureCount = userFailCount ? Number(userFailCount.Value) : 0;
  failureCount++;
  if (failureCount >= config.platformVars.maxUserLoginRetries) {
    try {
      // Updating the fail count
      await setLoginFailCount(failureCount, email, config.AWSVars.cognito.userpoolId);
      // Disabling the account
      await disableUserBasedOnFailCounts(email, config.AWSVars.cognito.userpoolId);
    } catch (error) {
      console.log('Error: ', error);
      throw error;
    }
  } else {
    try {
      await setLoginFailCount(failureCount, email, config.AWSVars.cognito.userpoolId);
    } catch (error) {
      console.log('Error: ', error);
      throw error;
    }
  }

  // Need to return something that says that the account has been locked, or successfull login or something...
  return true;
};

/**
 *  @function authenticateUser
 *  @summary Authenticate User via Cognito
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - The username of the cognito user (should be there email)
 *  @param {String} password - The password given by User
 *  @return {Promise} Returns a promise detailing success or failure of authenticateUser
 */
const authenticateUser = async (req, email, password, userInfoAttributes) => {
  const currentDate = new Date();
  const updatedAttribute = userInfoAttributes.UserAttributes.find(
    (userAttribute) => userAttribute.Name === 'custom:passwordUpdatedAt'
  );
  const failCountAttribute = userInfoAttributes.UserAttributes.find(
    (userAttribute) => userAttribute.Name === 'custom:fail_count'
  );
  const updatedAt = updatedAttribute ? updatedAttribute.Value : currentDate;

  if (updatedAttribute === null || updatedAttribute === undefined) {
    try {
      await handleUserOpeningPasswordDate(updatedAt, email, config.AWSVars.cognito.userpoolId);
    } catch (error) {
      console.log('Error: ', error);
      throw error;
    }
  }
  const promise = new Promise((resolve, reject) => {
    // Object to return.
    const authResult = {
      email: email,
      authenticationStatus: config.platformVars.authenticationStatus.Unauthenticated,
      token: '',
    };
    authResult['custom:passwordUpdatedAt'] = updatedAt;
    const authenticationData = {
      Username: email,
      Password: password,
    };
    // Create Authentication Details object from parameters.
    const authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);
    // Cognito User Pool parameters
    const poolData = {
      UserPoolId: config.AWSVars.cognito.userpoolId, // Your user pool id here
      ClientId: config.AWSVars.cognito.clientId, // Your client id here
    };
    // Cognito User Pool
    const userPool = new AWSCognito.CognitoUserPool(poolData);
    // Cognito User Parameters
    const userData = {
      Username: email,
      Pool: userPool,
    };
    // Cognito User
    const cognitoUser = new AWSCognito.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        authResult.authenticationStatus = config.platformVars.authenticationStatus.Authenticated;
        authResult.token = result.getAccessToken().getJwtToken();
        resolve(authResult);
      },
      onFailure: (err) => {
        // In case the account is in RESET_REQUIRED and has failed to login successfully multiple times...
        if (
          err.code === 'PasswordResetRequiredException' &&
          failCountAttribute.Value >= config.platformVars.maxUserLoginRetries
        ) {
          authResult.authenticationStatus = config.platformVars.authenticationStatus.ForceReset;
          resolve(authResult);
        } else if (err.code === 'PasswordResetRequiredException') {
          authResult.authenticationStatus = config.platformVars.authenticationStatus.ResetRequired;
          resolve(authResult);
        } else {
          handleLoginFailure(req, email).catch((err) => {
            logger.error('Error in cognitoUser.authenticateUser.handleLoginFailure', err);
            reject(err);
          });
          const userMessage = langResources.getResourceString('failedToAuthenticate');
          const sysMessage = [
            'Error User Authentication: ' + err,
            'Username: ' + authenticationData.Username,
          ].join('\n');
          const errObj = errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.failedToAuthenticate,
            userMessage,
            sysMessage
          );
          reject(errObj);
        }
      },
      newPasswordRequired: () => {
        authResult.authenticationStatus =
          config.platformVars.authenticationStatus.RequireNewPassword;
        resolve(authResult);
      },
    });
  });
  return promise;
};

/**
 *  @function setPassword
 *  @summary Sets Cognito User Password
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - The username of the cognito user (should be there email)
 *  @param {String} verificationCode - verification code given by User
 *  @param {String} newPassword - Optional parameter on new Password challenge
 *  @return {Promise} Returns a promise detailing success or failure of setPassword
 */
const setPassword = (req, email, verificationCode, newPassword) => {
  return new Promise((resolve, reject) => {
    // Cognito User Pool parameters
    const poolData = {
      UserPoolId: config.AWSVars.cognito.userpoolId, // Your user pool id here
      ClientId: config.AWSVars.cognito.clientId, // Your client id here
    };
    // Cognito User Pool
    const userPool = new AWSCognito.CognitoUserPool(poolData);
    // Cognito User parameters
    const userData = {
      Username: email,
      Pool: userPool,
    };
    // Cognito User
    const cognitoUser = new AWSCognito.CognitoUser(userData);
    cognitoUser.confirmPassword(verificationCode, newPassword, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

/**
 *  @function completeNewPasswordChallenge
 *  @summary Allows a user to change their password on initial login.
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} old_password - The user's old password.
 *  @param {String} new_password - The user's new password.
 *  @return {Promise} Returns a promise which returns true is success, error object otherwise.
 */
const completeNewPasswordChallenge = (req, old_password, new_password) => {
  const promise = new Promise((resolve, reject) => {
    // Create Authentication Data.
    const authenticationData = {
      Username: req.session.user_email,
      Password: old_password,
    };
    // Set Authentication Details.
    const authenticationDetails = new AWSCognito.AuthenticationDetails(authenticationData);
    // Cognito User Pool parameters
    const poolData = {
      UserPoolId: config.AWSVars.cognito.userpoolId, // Your user pool id here
      ClientId: config.AWSVars.cognito.clientId, // Your client id here
    };
    // Cognito User Pool
    const userPool = new AWSCognito.CognitoUserPool(poolData);
    //Cognito User parameters
    const userData = {
      Username: req.session.user_email,
      Pool: userPool,
    };
    // Cognito User
    const cognitoUser = new AWSCognito.CognitoUser(userData);
    try {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: () => {
          const userMessage = langResources.getResourceString('criticalError');
          const sysMessage = langResources.getResourceString('invaidInitialPasswordChange');
          const errObj = errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userAlreadyConfirmed,
            userMessage,
            sysMessage
          );
          reject(errObj);
        },
        onFailure: (err) => {
          const userMessage = langResources.getResourceString('loginFailed');
          const sysMessage = err;
          const errObj = errorUtils.createErrorMessage(
            req,
            errorUtils.errorCodes.userNotAuthenticated,
            userMessage,
            sysMessage
          );
          reject(errObj);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          cognitoUser.completeNewPasswordChallenge(
            new_password,
            {},
            {
              onSuccess: () => {
                resolve(true);
              },
              onFailure: (err) => {
                reject(err);
              },
            }
          );
        },
      });
    } catch (e) {
      const userMessage = langResources.getResourceString('loginFailed');
      const sysMessage = e;
      const errObj = errorUtils.createErrorMessage(
        req,
        errorUtils.errorCodes.userNotAuthenticated,
        userMessage,
        sysMessage
      );
      reject(errObj);
    }
  });
  return promise;
};

/**
 *
 * @param  {Object}  req   - Mandatory first parameter to pass the request object into the function in case session info is required.
 * @param  {String}  email - The username of the Cognito user (should be there email)
 * @param  {Error}   err   - The thrown error to check for the message
 * @returns {Promise}
 */
const resendTemporaryPassword = (req, email, err) => {
  return new Promise((resolve, reject) => {
    getUserInfo(email, config.AWSVars.cognito.userpoolId)
      .then((userInfo) => {
        // If the user's account is in the 'FORCE_CHANGE_PASSWORD' and that the error contains the below string,
        // it probably means that the account has been locked due to the user never login in with their temporary password
        if (userInfo.UserStatus === 'FORCE_CHANGE_PASSWORD') {
          // The solution is to send another temporary password to the user by sending a RESEND action.
          createUser(req, email, true, false)
            .then(() => {
              resolve(true);
            })
            .catch((createUserErr) => {
              console.log('Error trying to RESEND temporary password', createUserErr);
              reject(createUserErr);
            });
        } else {
          console.log('Error AdminResetUserPassword', err);
          reject(err);
        }
      })
      .catch((getUserInfoErr) => {
        console.log('Error getting user status', getUserInfoErr);
        reject(getUserInfoErr);
      });
  });
};

/**
 *  @function requestToResetPassword
 *  @summary Sends an email to the provided email address. The email contains a verification code,
 *           that a user can use to reset his/her password.
 *  @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param  {String}  email - The username of the cognito user (should be there email)
 *  @return {Promise} Returns a promise that resolves to true if successful, provides error object otherwise.
 */
const requestToResetPassword = async (req, email) => {
  console.log('RESETTING PASSWORD');
  return new Promise((resolve, reject) => {
    // Cognito User Pool parameters
    const poolData = {
      UserPoolId: config.AWSVars.cognito.userpoolId,
      ClientId: config.AWSVars.cognito.clientId,
    };
    // Cognito User Pool
    const userPool = new AWSCognito.CognitoUserPool(poolData);
    // Cognito User parameters
    const userData = {
      Username: email,
      Pool: userPool,
    };
    const cognitoUser = new AWSCognito.CognitoUser(userData);
    cognitoUser.forgotPassword({
      // Successfully initiated reset password request.
      onSuccess: () => {},
      onFailure: (err) => {
        console.log('Forgot Password Error: ', err);
        resendTemporaryPassword(req, email, err)
          .then(() => {
            resolve(config.platformVars.authenticationStatus.ResendPassword);
          })
          .catch((resendTemporaryPasswordErr) => {
            console.log('Resend Error: ', resendTemporaryPasswordErr);
            reject(resendTemporaryPasswordErr);
          });
      },
      inputVerificationCode: () => {
        resolve(config.platformVars.authenticationStatus.ConfirmPassword);
      },
    });
  });
};

/**
 *  @function adminResetUserPassword
 *  @summary Resets the user's password in AWS Cognito. User will need to reset their password.
 *  @param  {Object}  req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param  {String}  email - The username of the cognito user (should be there email)
 *  @return {Promise<Boolean>} Returns if the action has been processed correctly
 */
const adminResetUserPassword = (req, email) => {
  return new Promise((resolve, reject) => {
    // Set API parameters
    const parameters = {
      UserPoolId: config.AWSVars.cognito.userpoolId,
      Username: email,
    };

    // Call API action
    cognitoIdentityServiceProvider
      .adminResetUserPassword(parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        // In case there is an error, we want to double check that the error is not due to the user being in an "inactive"
        // status due to not login in with their temporary password after a few days.
        resendTemporaryPassword(req, email, err)
          .then(() => {
            resolve(true);
          })
          .catch((resendTemporaryPasswordErr) => {
            reject(resendTemporaryPasswordErr);
          });
      });
  });
};

/**
 *  @function updateUser
 *  @summary Update Cognito User
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - Cognito Username
 *  @param {Object[]} attributes - Array of Name, Value pair of attribtues
 *  @return {Promise} Returns a promise detailing success or failure of disableUser
 */
const updateUser = (req, email, attributes) => {
  const promise = new Promise((resolve, reject) => {
    // Parameters required to update user attributes
    const params = {
      UserPoolId: config.AWSVars.cognito.userpoolId,
      Username: email,
      UserAttributes: [...attributes],
    };

    cognitoIdentityServiceProvider.adminUpdateUserAttributes(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
  return promise;
};

/**
 *  @function userExists
 *  @summary Check if a user exists.
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} email - Cognito Username
 *  @return {Promise} Returns a promise detailing success or failure of disableUser
 */
const userExists = (req, email) => {
  return new Promise((resolve, reject) => {
    // Parameters required to update user attributes
    const params = {
      UserPoolId: config.AWSVars.cognito.userpoolId,
      Username: email,
    };

    cognitoIdentityServiceProvider.adminGetUser(params, (err, data) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 *  @function confirmForgotPassword
 *  @summary API action to confirm forgotten password flow
 *  @param {Object} req - Mandatory first parameter to pass the request object into the function in case session info is required.
 *  @param {String} confirmationCode - confirmation code sent to user
 *  @param {String} newPassword - new passowrd
 *  @param {String} username - Username
 *  @return {Promise} Returns a promise detailing success or failure of confirmForgotPassword
 */
const confirmForgotPassword = (req, confirmationCode, newPassword, username) => {
  return new Promise((resolve, reject) => {
    const parameters = {
      ClientId: config.AWSVars.cognito.clientId,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
      Username: username,
    };

    cognitoIdentityServiceProvider.confirmForgotPassword(parameters, (err, data) => {
      if (err) {
        if (err.code === 'ExpiredCodeException') {
          resolve('ExpiredCodeException');
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
};

const resendConfirmationCode = (req, username) => {
  return new Promise((resolve, reject) => {
    const parameters = {
      ClientId: config.AWSVars.cognito.clientId,
      Username: username,
    };

    cognitoIdentityServiceProvider
      .resendConfirmationCode(parameters)
      .then(() => {
        resolve(true);
      })
      .catch((err) => {
        console.log('Error resending confirmation code', err);
        reject(false);
      });
  });
};

function initialize() {
  //Instantiate a new Cognito Identity Service Provider.
  cognitoIdentityServiceProvider = new CognitoIdentityProvider();
}

module.exports = {
  resetLoginAttributes,
  requestToResetPassword,
  setPassword,
  authenticateUser,
  deleteUser,
  createUser,
  initialize,
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

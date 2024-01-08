const path = require('path');
const {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} = require('amazon-cognito-identity-js');
const config = require('../../../config/env/common');
const logger = require('../../../config/privateutils/logger.utils');

const poolData = {
  UserPoolId: config.AWSVars.cognito.userpoolId, // Your user pool id here
  ClientId: config.AWSVars.cognito.clientId, // Your client id here
};

exports.helpCenter = (req, res) => {
  const { username, password } = req.body;

  try {
    const userData = {
      Username: username,
      Pool: new CognitoUserPool(poolData),
    };

    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        logger.info(`Helpcenter authentication succeeded.`);
        res.json({
          success: true,
          token: result.getAccessToken().getJwtToken(),
        });
      },

      onFailure: (err) => {
        logger.error(`Helpcenter authentication failed: ${JSON.stringify(err)}`);
        res.status(403).json({
          success: false,
          message: 'Username or password is not correct',
        });
      },

      newPasswordRequired: () => {
        logger.error(`Helpcenter authentication failed: newPasswordRequired`);
        res.status(403).json({
          success: false,
          message: 'Username needs newPassword.  Try normal website login (outside help center).',
        });
      },
    });
  } catch (e) {
    logger.error(`Authentication failed: ${JSON.stringify(e)}`);
    res.json({
      success: false,
      message: 'Request failed. Check your request body.',
    });
  }
};

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import * as config from '../../../config/env/common';
import logger from '../../../config/privateutils/logger.utils';
const cognitoClient = new CognitoIdentityProviderClient({ region: config.AWSVars.region });

export const helpCenter = async (req, res) => {
  const { username, password } = req.body;

  const params: InitiateAuthCommandInput = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: config.AWSVars.cognito.clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const command = new InitiateAuthCommand(params);
    const response = await cognitoClient.send(command);

    logger.info('Help Center authentication succeeded.');
    res.json({
      success: true,
      token: response.AuthenticationResult?.AccessToken,
    });
  } catch (err) {
    const errorMsg =
      err.name === 'NotAuthorizedException'
        ? 'Username or password is not correct'
        : err.name === 'PasswordResetRequiredException'
        ? 'Password reset required. Try logging in via the main website.'
        : 'Authentication failed';

    logger.error(`Help Center authentication failed: ${JSON.stringify(err)}`);
    res.status(403).json({
      success: false,
      message: errorMsg,
    });
  }
};

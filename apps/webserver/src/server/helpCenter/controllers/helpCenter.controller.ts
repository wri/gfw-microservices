import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import * as config from '../../../config/env/common';
import logger from '../../../config/privateutils/logger.utils';
import { Request, Response } from 'express';

const { region } = config.AWSVars;
const cognitoClient = new CognitoIdentityProviderClient({ region });

interface HelpCenterLoginRequestBody {
  username: string;
  password: string;
}

type TypedBodyRequest<T> = Request<unknown, unknown, T>;

export const helpCenter = async (
  req: TypedBodyRequest<HelpCenterLoginRequestBody>,
  res: Response
): Promise<Response | void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    logger.warn('Missing username or password in Help Center auth request.');
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.',
    });
  }

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
  } catch (err: unknown) {
    let errorMsg = 'Authentication failed';

    if (err instanceof Error && 'name' in err) {
      switch (err.name) {
        case 'NotAuthorizedException':
          errorMsg = 'Username or password is not correct';
          break;
        case 'PasswordResetRequiredException':
          errorMsg = 'Password reset required. Try logging in via the main website.';
          break;
      }
    }

    logger.error(`Help Center authentication failed: ${JSON.stringify(err)}`);
    res.status(401).json({
      success: false,
      message: errorMsg,
    });
  }
};

import { Injectable, InternalServerErrorException, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../api-keys/token.service';
import { featureFlagsService } from '@wri-monorepos/shared';
// TODO: Verify the key is valid and extract the organization data from database
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    const { userEmail } = req.body as { userEmail: string };
    if (!apiKey) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const apiKeyRecord = await this.tokenService.findToken(apiKey);
    if (!apiKeyRecord) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();
    const flags = await getFeatureFlagsForCurrentOrg(apiKeyRecord.organizationId);

    const hasFlagForExternalApiEnabled = flags.some(
      (f) => f.flagId === 'PermanentFlagForExternalApiKeys'
    );

    if (!hasFlagForExternalApiEnabled) {
      return res.status(401).json({ message: 'Feature not authorized' });
    }
    // Work in progress, ticket needs to be created to implement this
    req.user = {
      organizationId: apiKeyRecord.organizationId,
    };
    // If the userEmail param is present, check if it is valid.
    //  Heads Up we need to force user to send userEmail in controller when we want to validate
    if (typeof userEmail !== 'undefined') {
      // Check if the user email is present but invalid
      if (userEmail === '' || userEmail === null) {
        return res.status(400).json({ message: 'userEmail is required' });
      }
      try {
        const validUserEmail = await this.tokenService.findUserEmailByToken(
          apiKeyRecord.organizationId,
          userEmail
        );
        if (validUserEmail) {
          req.user = {
            ...req.user,
            hasValidEmail: true,
            organization_user_id: validUserEmail.organization_user_id,
          };
        } else {
          return res.status(401).json({ msg: `Unauthorized User ${userEmail} email not found` });
        }
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    }
    // If the API key is valid, continue with the request
    next();
  }
}

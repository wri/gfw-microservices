import { Injectable, NestMiddleware } from '@nestjs/common';
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
    // If the user email is present, check if it is valid
    if (typeof userEmail !== 'undefined') {
      try {
        const validUserEmail = await this.tokenService.findUserEmailByToken(
          apiKeyRecord.organizationId,
          userEmail
        );
        if (validUserEmail) {
          req.user = {
            ...req.user,
            hasValidEmail: validUserEmail,
          };
        } else {
          return res.status(401).json({ message: 'Unauthorized' });
        }
      } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
    // If the API key is valid, continue with the request
    next();
  }
}

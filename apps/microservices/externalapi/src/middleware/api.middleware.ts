import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../api-keys/token.service';
import { createFeatureFlagsService } from '@wri-monorepos/feature-flags';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
// TODO: Verify the key is valid and extract the organization data from database
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    @InjectDataSource('default') private connection: DataSource
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const apiKeyRecord = await this.tokenService.findToken(apiKey);
    if (!apiKeyRecord) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const featureFlagsService = createFeatureFlagsService(this.connection);
    const flags = await featureFlagsService.getFeatureFlagsForCurrentOrg(
      apiKeyRecord.organizationId
    );

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
    // If the API key is valid, continue with the request
    next();
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../api-keys/token.service';
// TODO: Verify the key is valid and extract the organization data from database
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const apiKeyRecord = await this.tokenService.findToken(apiKey);
    if (!apiKeyRecord) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Work in progress, ticket needs to be created to implement this
    req.user = {
      organizationId: apiKeyRecord.organizationId,
    };
    // If the API key is valid, continue with the request
    next();
  }
}

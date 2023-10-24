import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// TODO: Verify the key is valid and extract the organization data from database
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'YOUR_API_KEY_HERE') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Work in progress, ticket needs to be created to implement this
    req.user = {
      organizationId: 1,
    };
    // If the API key is valid, continue with the request
    next();
  }
}

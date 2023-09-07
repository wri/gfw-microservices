import { Controller, Get, UseGuards, Request } from '@nestjs/common';

import { AppService } from './app.service';
import { ApiKeyGuard } from '../tokens/auth.guard';
import { TokenService } from '../tokens/token.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly tokenService: TokenService
  ) {}

  /**
   * Healthcheck for fargate
   */
  @Get('/HealthCheck')
  getHealthCheck(): string {
    return this.appService.getHealthCheck();
  }

  @Get('/protected')
  @UseGuards(ApiKeyGuard)
  protectedEndpoint(@Request() req) {
    // This endpoint is protected by the token middleware
    return 'Protected endpoint accessed by user: ' + req.user.username;
  }
}

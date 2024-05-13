import { Controller, Get, UseGuards, Request } from '@nestjs/common';

import { AppService } from './app.service';
import { ApiKeyGuard } from '../api-keys/auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  /**
   * Latest commit hash
   */

  @Get('/latest_commit')
  getLatestCommit(): string {
    return process.env.NODE_ENV === 'development' ? 'dev' : process.env.LATEST_COMMIT;
  }
}

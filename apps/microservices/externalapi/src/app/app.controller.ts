import { Controller, Get, UseGuards, Request } from '@nestjs/common';

import { AppService } from './app.service';
import { ApiKeyGuard } from '../api-keys/auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Env } from '../env';

//We need this annotation to avoid this controller to be shown on Swagger docs
@ApiExcludeController()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly config: ConfigService<Env, true>
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

  /**
   * Latest commit hash
   */

  @Get('/latest_commit')
  getLatestCommit(): string {
    return this.config.get('NODE_ENV') === 'development' ? 'dev' : this.config.get('LATEST_COMMIT');
  }
}

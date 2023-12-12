import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

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

  /**
   * Latest commit hash
   */
  @Get('/latest_commit')
  getLatestCommit(): string {
    return process.env.LATEST_COMMIT;
  }
}

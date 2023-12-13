import { Controller, Get } from '@nestjs/common';
import { AppService } from '../application/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Healthcheck for fargate
   */
  @Get('/HealthCheck')
  HealthCheck(): string {
    return 'Is Alive';
  }

  /**
   * Latest commit hash
   */
  @Get('/latest_commit')
  getLatestCommit(): string {
    return process.env.LATEST_COMMIT;
  }
}

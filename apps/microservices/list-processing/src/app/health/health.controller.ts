// health.controller.ts
import { Controller, Get, Logger } from '@nestjs/common';

// Module-level counter to track across all instances
let counter = 0;
let firstTime = true;

@Controller('HealthCheck')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  check() {
    // Track Fargate health check calls
    // intended for checking ECS fargate health check (task-definition-web-prod.json)
    // https://gfw.atlassian.net/browse/GPV-4530
    counter++;

    if (firstTime) {
      global.setInterval(() => {
        this.logger.log(`Per minute health check counter: ${counter}`);
        counter = 0;
      }, 1000 * 60); // every minute
      firstTime = false;
    }

    return { status: 'ok' };
  }
}

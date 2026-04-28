import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { ServerConfigType } from '../../validators/server-config';

@Controller('HealthCheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly configService: ConfigService<ServerConfigType, true>
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () =>
        this.http.pingCheck(
          'LP',
          `${this.configService.get('LIST_PROCESSING_MICROSERVICE_URL', {
            infer: true,
          })}/HealthCheck`
        ),
    ]);
  }
}

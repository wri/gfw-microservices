// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('HealthCheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private http: HttpHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('database', { timeout: 10000 }),
      async () => this.http.pingCheck('LP', `${process.env.LLP_BASE_URL}/api/HealthCheck`),
      async () => this.http.pingCheck('LD', `${process.env.LD_MICROSERVICE_URL}/HealthCheck`),
      () => this.memory.checkHeap('memory_heap', 4 * 1024 * 1024 * 1024), // 4GB
    ]);
  }
}

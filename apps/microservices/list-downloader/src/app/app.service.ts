import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Healthcheck for fargate
   */
  getHealthCheck(): string {
    return 'Healthy';
  }
}

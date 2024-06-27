import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AlertsIntegratedNaturalForestService {
  private readonly logger = new Logger(AlertsIntegratedNaturalForestService.name);

  constructor() {
    this.logger.log('AlertsIntegratedNaturalForestService initialized');
  }
}

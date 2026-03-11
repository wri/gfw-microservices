import { Injectable, Logger, Scope } from '@nestjs/common';
import {
  AlertFieldsFileRequest,
  ClientStoreConnection,
  DashboardDataType,
} from '@wri-monorepos/sql';

import { IPipeService } from '../pipe/i.pipe.service';
import { getAllFilesAndZip } from '../shared/file.utils';
import { AlertsGlobalIntegratedDisturbanceDailyService } from './alerts.global.integrated.disturbance.daily.service';

@Injectable({
  scope: Scope.REQUEST,
})
export class AlertsFileService extends IPipeService {
  private readonly logger = new Logger(AlertsFileService.name);

  constructor(
    private readonly alertsGlobalIntegratedDisturbanceDailyService: AlertsGlobalIntegratedDisturbanceDailyService,
    private readonly clientStoreConnection: ClientStoreConnection
  ) {
    super();
  }

  async start(filters: AlertFieldsFileRequest) {
    await this.startEmail(filters);
    this.alertsGlobalIntegratedDisturbanceDailyService.start(filters);
  }

  process(analysisData: DashboardDataType[]) {
    this.alertsGlobalIntegratedDisturbanceDailyService.process(analysisData);
  }

  async finish(filters: AlertFieldsFileRequest) {
    const { key } = filters;
    await this.alertsGlobalIntegratedDisturbanceDailyService.finish(filters);
    this.logger.log(`(${key}) - Zipping files`);
    await getAllFilesAndZip(filters);
    await this.finishProcess(filters);
  }
}

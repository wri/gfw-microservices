import { Injectable, Logger, Scope } from '@nestjs/common';
import {
  AlertFieldsFileRequest,
  AlertsTimeframes,
  ClientStoreConnection,
  DashboardDataType,
} from '@wri-monorepos/sql';

import { IPipeService } from '../pipe/i.pipe.service';
import { AlertsAdminAreasLevelService } from './alerts.admin.areas.level.service';
import { AlertsHistoryService } from './alerts.history.service';
import { AlertsLocationsLevelService } from './alerts.locations.level.service';
import { AlertsPrioritiesAdminAreasLevelService } from './alerts.priorities.admin.areas.level.service';
import { AlertsPrioritiesLocationsLevelService } from './alerts.priorities.locations.level.service';
import { AlertsSummaryService } from './alerts.summary.service';
import { getAllFilesAndZip } from '../shared/file.utils';
import { AlertsIntegratedNaturalForestService } from './alerts.integrated.natural.forest.service';
import { AlertsGlobalIntegratedDisturbanceDailyService } from './alerts.global.integrated.disturbance.daily.service';

@Injectable({
  scope: Scope.REQUEST,
})
export class AlertsFileService extends IPipeService {
  private readonly logger = new Logger(AlertsFileService.name);

  constructor(
    private readonly alertsAdminAreasLevelService: AlertsAdminAreasLevelService,
    private readonly alertsHistoryService: AlertsHistoryService,
    private readonly alertsLocationsLevelService: AlertsLocationsLevelService,
    private readonly alertsPrioritiesAdminAreasLevelService: AlertsPrioritiesAdminAreasLevelService,
    private readonly alertsPrioritiesLocationsLevelService: AlertsPrioritiesLocationsLevelService,
    private readonly alertsSummaryService: AlertsSummaryService,
    private readonly alertsIntegratedNaturalForestService: AlertsIntegratedNaturalForestService,
    private readonly alertsGlobalIntegratedDisturbanceDailyService: AlertsGlobalIntegratedDisturbanceDailyService,
    private readonly clientStoreConnection: ClientStoreConnection
  ) {
    super();
  }

  async start(filters: AlertFieldsFileRequest) {
    const { selectedTimeframe } = filters;
    await this.startEmail(filters);
    if (selectedTimeframe === AlertsTimeframes.DAY) {
      this.alertsIntegratedNaturalForestService.start(filters);
      this.alertsGlobalIntegratedDisturbanceDailyService.start(filters);
    } else {
      await this.alertsLocationsLevelService.start(filters);
      await this.alertsPrioritiesLocationsLevelService.start(filters);
      this.alertsAdminAreasLevelService.start(filters);
      this.alertsHistoryService.start(filters);
      this.alertsPrioritiesAdminAreasLevelService.start(filters);
      this.alertsSummaryService.start(filters);
    }
  }

  process(analysisData: DashboardDataType[], filters: AlertFieldsFileRequest) {
    const { selectedTimeframe } = filters;
    if (selectedTimeframe === AlertsTimeframes.DAY) {
      this.alertsIntegratedNaturalForestService.process(analysisData);
      this.alertsGlobalIntegratedDisturbanceDailyService.process(analysisData);
    } else {
      this.alertsLocationsLevelService.process(analysisData);
      this.alertsAdminAreasLevelService.process(analysisData);
      this.alertsHistoryService.process(analysisData);
      this.alertsPrioritiesAdminAreasLevelService.process(analysisData);
      this.alertsPrioritiesLocationsLevelService.process(analysisData);
      this.alertsSummaryService.process(analysisData);
    }
  }

  async finish(filters: AlertFieldsFileRequest) {
    const { key, selectedTimeframe } = filters;
    if (selectedTimeframe === AlertsTimeframes.DAY) {
      await this.alertsIntegratedNaturalForestService.finish(filters);
      await this.alertsGlobalIntegratedDisturbanceDailyService.finish(filters);
    } else {
      await this.alertsLocationsLevelService.finish(filters);
      await this.alertsAdminAreasLevelService.finish(filters);
      await this.alertsHistoryService.finish(filters);
      await this.alertsPrioritiesAdminAreasLevelService.finish(filters);
      await this.alertsPrioritiesLocationsLevelService.finish(filters);
      await this.alertsSummaryService.finish(filters);
    }
    this.logger.log(`(${key}) - Zipping files`);
    await getAllFilesAndZip(filters);
    await this.finishProcess(filters);
  }
}

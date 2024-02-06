import { Injectable, Logger } from '@nestjs/common';
import { AlertFieldsFileRequest, DashboardDataType } from '@wri-monorepos/sql';

import { IPipeService } from '../pipe/i.pipe.service';
import { AlertsAdminAreasLevelService } from './alerts.admin.areas.level.service';
import { AlertsHistoryService } from './alerts.history.service';
import { AlertsLocationsLevelService } from './alerts.locations.level.service';
import { AlertsPrioritiesAdminAreasLevelService } from './alerts.priorities.admin.areas.level.service';
import { AlertsPrioritiesLocationsLevelService } from './alerts.priorities.locations.level.service';
import { AlertsSummaryService } from './alerts.summary.service';
import { getAllFilesAndZip } from '../shared/file.utils';

@Injectable()
export class AlertsFileService extends IPipeService {
  private readonly logger = new Logger(AlertsFileService.name);
  constructor(
    private readonly alertsAdminAreasLevelService: AlertsAdminAreasLevelService,
    private readonly alertsHistoryService: AlertsHistoryService,
    private readonly alertsLocationsLevelService: AlertsLocationsLevelService,
    private readonly alertsPrioritiesAdminAreasLevelService: AlertsPrioritiesAdminAreasLevelService,
    private readonly alertsPrioritiesLocationsLevelService: AlertsPrioritiesLocationsLevelService,
    private readonly alertsSummaryService: AlertsSummaryService
  ) {
    super();
  }

    async start(filters: AlertFieldsFileRequest) {
      await this.startEmail(filters);
      await this.alertsLocationsLevelService.start(filters);
      await this.alertsPrioritiesLocationsLevelService.start(filters);
      this.alertsAdminAreasLevelService.start(filters);
      this.alertsHistoryService.start(filters);
      this.alertsPrioritiesAdminAreasLevelService.start(filters);
      this.alertsSummaryService.start(filters);
    }
    process(analysisData: DashboardDataType[]) {
      this.alertsLocationsLevelService.process(analysisData);
      this.alertsPrioritiesLocationsLevelService.process(analysisData);
      this.alertsAdminAreasLevelService.process(analysisData);
      this.alertsHistoryService.process(analysisData);
      this.alertsPrioritiesAdminAreasLevelService.process(analysisData);
      this.alertsPrioritiesLocationsLevelService.process(analysisData);
      this.alertsSummaryService.process(analysisData);
    }
    async finish(filters: AlertFieldsFileRequest) {
      const { key } = filters;
      await this.alertsLocationsLevelService.finish(filters);
      await this.alertsPrioritiesLocationsLevelService.finish(filters);
      await this.alertsAdminAreasLevelService.finish(filters);
      await this.alertsHistoryService.finish(filters);
      await this.alertsLocationsLevelService.finish(filters);
      await this.alertsPrioritiesAdminAreasLevelService.finish(filters);
      await this.alertsPrioritiesLocationsLevelService.finish(filters);
      await this.alertsSummaryService.finish(filters);

      this.logger.log(`(${key}) - Zipping files`);
      await getAllFilesAndZip(filters);
      await this.finishProcess(filters);
    }


}

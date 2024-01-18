import { AnalysisDashboard } from '../entity/organization/analysis.dashboard.entity';

export class AnalysisDashboardDTO {
  id: number;
  listId: number;
  locationId: number;
  gadmId: string;
  gladAlertsCoverage: Record<string, number>;
  gladAlertsDaily: Record<string, number>;
  gladAlertsWeekly: Record<string, number>;
  gladAlertsMonthly: Record<string, number>;
  viirsAlertsDaily: Record<string, number>;
  treeCoverExtentTotal: number;

  public fromEntity(entity: AnalysisDashboard): AnalysisDashboardDTO {
    this.id = entity.id;
    this.listId = entity.listId;
    this.locationId = entity.locationId;
    this.gadmId = entity.gadmId;
    this.gladAlertsCoverage = JSON.parse(entity.gladAlertsCoverage);
    this.gladAlertsDaily = JSON.parse(entity.gladAlertsDaily);
    this.gladAlertsWeekly = JSON.parse(entity.gladAlertsWeekly);
    this.gladAlertsMonthly = JSON.parse(entity.gladAlertsMonthly);
    this.viirsAlertsDaily = JSON.parse(entity.viirsAlertsDaily);
    this.treeCoverExtentTotal = entity.treeCoverExtentTotal;
    return this;
  }
}

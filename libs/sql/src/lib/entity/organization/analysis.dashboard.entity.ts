import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Analyses-Dashboard' })
export class AnalysisDashboard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'list_id' })
  listId: number;

  @Column({ name: 'location_id' })
  locationId: number;

  @Column({ name: 'gadm_id', length: 25 })
  gadmId: string;

  @Column({ name: 'glad_alerts_coverage' })
  gladAlertsCoverage: string;

  @Column({ name: 'glad_alerts_daily' })
  gladAlertsDaily: string;

  @Column({ name: 'glad_alerts_weekly' })
  gladAlertsWeekly: string;

  @Column({ name: 'glad_alerts_monthly' })
  gladAlertsMonthly: string;

  @Column({ name: 'viirs_alerts_daily' })
  viirsAlertsDaily: string;

  @Column({ name: 'tree_cover_extent_total' })
  treeCoverExtentTotal: number;
}

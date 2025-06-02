import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'Analyses-Dashboard' })
@Unique(['listId', 'locationId'])
export class AnalysesDashboardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'list_id' })
  listId: number;

  @Column({ name: 'location_id', nullable: true })
  locationId: number;

  @Column({ name: 'location_error', type: 'nvarchar', nullable: true })
  location_error: string;

  @Column({ name: 'gadm_id', nullable: true })
  gadmId: string;

  @Column({ name: 'glad_alerts_coverage', nullable: true })
  gladAlertsCoverage: string;

  @Column({ name: 'glad_alerts_daily', nullable: true })
  gladAlertsDaily: string;

  @Column({ name: 'glad_alerts_weekly', nullable: true })
  gladAlertsWeekly: string;

  @Column({ name: 'glad_alerts_monthly', nullable: true })
  gladAlertsMonthly: string;

  @Column({ name: 'viirs_alerts_daily', nullable: true })
  viirsAlertsDaily: string;

  @Column({ name: 'tree_cover_extent_total', nullable: true })
  treeCoverExtentTotal: number;

  @Column({ name: 'integrated_alerts_coverage', nullable: true })
  integratedAlertsCoverage: string;

  @Column({ name: 'total_ha', nullable: true })
  totalHa: number;

  @Column({ name: 'integrated_alerts_daily_all_nominal', nullable: true })
  integratedAlertsDailyAllNominal: string;

  @Column({ name: 'integrated_alerts_daily_all_high', nullable: true })
  integratedAlertsDailyAllHigh: string;

  @Column({ name: 'integrated_alerts_daily_all_highest', nullable: true })
  integratedAlertsDailyAllHighest: string;

  @Column({ name: 'integrated_alerts_daily_sbtn_nominal', nullable: true })
  integratedAlertsDailySbtnNominal: string;

  @Column({ name: 'integrated_alerts_daily_sbtn_high', nullable: true })
  integratedAlertsDailySbtnHigh: string;

  @Column({ name: 'integrated_alerts_daily_sbtn_highest', nullable: true })
  integratedAlertsDailySbtnHighest: string;

  @Column({ name: 'integrated_alerts_daily_jrc_nominal', nullable: true })
  integratedAlertsDailyJrcNominal: string;

  @Column({ name: 'integrated_alerts_daily_jrc_high', nullable: true })
  integratedAlertsDailyJrcHigh: string;

  @Column({ name: 'integrated_alerts_daily_jrc_highest', nullable: true })
  integratedAlertsDailyJrcHighest: string;

  @Column({ name: 'status_code', nullable: true })
  statusCode: number;
}

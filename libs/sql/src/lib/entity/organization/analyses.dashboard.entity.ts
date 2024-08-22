import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Analyses-Dashboard' })
export class AnalysesDashboardEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'list_id' })
    listId: number;

    @Column({ name: 'location_id', nullable: true })
    locationId: number;

    @Column({ name: 'gadm_id', type: 'nvarchar', length: 25, nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS' })
    gadmId: string;

    @Column({ name: 'glad_alerts_coverage', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS' })
    gladAlertsCoverage: string;

    @Column({ name: 'glad_alerts_daily', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS' })
    gladAlertsDaily: string;

    @Column({ name: 'glad_alerts_weekly', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS' })
    gladAlertsWeekly: string;

    @Column({ name: 'glad_alerts_monthly', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS' })
    gladAlertsMonthly: string;

    @Column({ name: 'viirs_alerts_daily', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS' })
    viirsAlertsDaily: string;

    @Column({ name: 'tree_cover_extent_total', type: 'decimal', precision: 18, scale: 6, nullable: true })
    treeCoverExtentTotal: number;

    @Column({ name: 'integrated_alerts_coverage', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsCoverage: string;

    @Column({ name: 'total_ha', type: 'float', nullable: true })
    totalHa: number;

    @Column({ name: 'integrated_alerts_daily_all_nominal', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailyAllNominal: string;

    @Column({ name: 'integrated_alerts_daily_all_high', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailyAllHigh: string;

    @Column({ name: 'integrated_alerts_daily_all_highest', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailyAllHighest: string;

    @Column({ name: 'integrated_alerts_daily_sbtn_nominal', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailySbtnNominal: string;

    @Column({ name: 'integrated_alerts_daily_sbtn_high', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailySbtnHigh: string;

    @Column({ name: 'integrated_alerts_daily_sbtn_highest', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailySbtnHighest: string;

    @Column({ name: 'integrated_alerts_daily_jrc_nominal', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailyJrcNominal: string;

    @Column({ name: 'integrated_alerts_daily_jrc_high', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailyJrcHigh: string;

    @Column({ name: 'integrated_alerts_daily_jrc_highest', type: 'nvarchar', nullable: true, collation: 'SQL_Latin1_General_CP1_CI_AS', default: '{}' })
    integratedAlertsDailyJrcHighest: string;

    @Column({ name: 'status_code', type: 'int', nullable: true })
    statusCode: number;
}

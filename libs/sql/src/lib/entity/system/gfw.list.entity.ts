import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'GFWLists' })
export class GFWList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'list_name' })
  listName: string;

  @Column({ name: 'list_table_name' })
  listTableName: string;

  @Column({ name: 'list_analysis_table_name' })
  listAnalysisTableName: string;

  @Column({ name: 'list_status_id' })
  listStatusId: number;

  @Column({ name: 'list_error_message' })
  listErrorMessage: string;

  @Column({ name: 'list_locations_count' })
  listLocationsCount: number;

  @Column({ name: 'dashboard_last_submit' })
  dashboardLastSubmit: Date;

  @Column({ name: 'dashboard_last_results' })
  dashboardLastResults: Date;
}

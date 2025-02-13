import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'GFWLists' })
@Unique(['list_name'])
export class ListGFWLists {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'list_name' })
  list_name: string;

  @Column({ name: 'list_table_name' })
  list_table_name: string;

  @Column({ name: 'list_analysis_table_name' })
  list_analysis_table_name: string;

  @Column({ name: 'list_status_id' })
  list_status_id: number;

  @Column({ name: 'list_error_message' })
  list_error_message: string;

  @Column({ name: 'list_locations_count' })
  list_locations_count: number;

  @Column({ name: 'dashboard_last_submit' })
  dashboard_last_submit: Date;

  @Column({ name: 'dashboard_last_results' })
  dashboard_last_results: Date;
}

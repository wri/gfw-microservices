import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Lists' })
export class List {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'template_id' })
  templateId: number;

  @Column({ name: 'list_name' })
  listName: string;

  @Column({ name: 'list_table_name' })
  listTableName: string;

  @Column({ name: 'list_analysis_table_name' })
  listAnalysisTableName: string;

  @Column({ name: 'list_status_id' })
  listStatusId: number;

  @Column({ name: 'list_error_message', nullable: true })
  listErrorMessage: string | null;

  @Column({ name: 'location_classification' })
  locationClassification: string;

  @Column({ name: 'custom_attribute_names' })
  customAttributeNames: string;

  @Column({ name: 'custom_attribute_types' })
  customAttributeTypes: string;

  @Column({ name: 'list_locations_count' })
  listLocationsCount: number;

  @Column({ name: 'lock_status', nullable: true })
  lockStatus: number | null;

  @Column({ name: 'lock_user_id', nullable: true })
  lockUserId: number | null;

  @Column({ name: 'associated_gfwlist' })
  associatedGfwlist: number;

  @Column({ name: 'dashboard_last_submit' })
  dashboardLastSubmit: Date;

  @Column({ name: 'dashboard_last_results' })
  dashboardLastResults: Date;

  @Column({ name: 'vector_tiles_storage_path' })
  vectorTilesStoragePath: string;

  @Column({ name: 'error_file_storage_path', nullable: true })
  errorFileStoragePath: string | null;

  @Column({ name: 'vector_tiles_last_updated' })
  vectorTilesLastUpdated: Date;
}

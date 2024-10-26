import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Lists' })
export class Lists {
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
  listErrorMessage: string;

  @Column({ name: 'location_classification' })
  locationClassification: string;

  @Column({ name: 'custom_attribute_names', nullable: true })
  customAttributeNames: string;

  @Column({ name: 'custom_attribute_types', nullable: true })
  customAttributeTypes: string;

  @Column({ name: 'list_locations_count' })
  listLocationsCount: number;

  @Column({ name: 'lock_status', nullable: true })
  lockStatus: Date;

  @Column({ name: 'lock_user_id', nullable: true })
  lockUserId: number;

  @Column({ name: 'associated_gfwlist', nullable: true })
  associatedGFWlist: number;

  @Column({ name: 'dashboard_last_submit', nullable: true })
  dashboardLastSubmit: Date;

  @Column({ name: 'dashboard_last_results', nullable: true })
  dashboardLastResults: Date;

  @Column({ name: 'vector_tiles_storage_path' })
  vectorTilesStoragePath: string;

  @Column({ name: 'error_file_storage_path', nullable: true })
  errorFileStoragePath: string;

  @Column({ name: 'vector_tiles_last_updated' })
  vectorTilesLastUpdated: Date;

  @Column({ name: 'version', default: 0 })
  version: number;

  @Column({ name: 'Commodity', nullable: true })
  Commodity: string | null;
}

import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ListsProcessing' })
export class ListsProcessing {
  @PrimaryColumn({ name: 'list_id' })
  listId: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({
    name: 'area_analyzed_locations_ha',
    type: 'decimal',
    precision: 18,
    scale: 2,
    nullable: true,
  })
  areaAnalyzedLocationsHa: number;

  @Column({ name: 'locations_analyzed', nullable: true })
  locationsAnalyzed: number;

  @Column({ name: 'analysis_type' })
  analysisType: string;

  @Column({ name: 'analysis_end_time', nullable: true })
  analysisEndTime: Date;

  @Column({ name: 'analysis_start_time', nullable: true })
  analysisStartTime: Date;
}

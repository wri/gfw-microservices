import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'ChargeRate' })
@Unique(['analysisType', 'effectiveDate'])
export class ChargeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'analysis_type', type: 'varchar', length: 50 })
  analysisType: string;

  @Column({ name: 'effective_date', type: 'datetime' })
  effectiveDate: Date;

  @Column({ name: 'list_rate', type: 'decimal', precision: 10, scale: 4 })
  listRate: number;

  @Column({ name: 'location_rate', type: 'decimal', precision: 10, scale: 4 })
  locationRate: number;
}

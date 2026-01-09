import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'ChargeRate' })
export class ChargeRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  analysisType: string;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  listRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  locationRate: number;
}

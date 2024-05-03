import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';

@Entity({ name: 'FeatureFlags' })
export class FeatureFlag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { name: 'flag_id' })
  flagId: string;

  @Column('int', { name: 'org_id', nullable: true })
  orgId: number;

  // flag_state is bit in mssql, but test env uses sqlite, which requires int because it doesn't support bit
  @Column({ name: 'flag_state', type: process.env.NODE_ENV === 'test' ? 'int' : 'bit' })
  flagState: boolean;

  @Column('int', { name: 'modifier_user_id' })
  modifierUserId: number;

  @UpdateDateColumn({ name: 'update_date_time' })
  updateDateTime: Date;

  @ManyToOne(() => Organization, (org) => org.id, { nullable: true })
  @JoinColumn({ name: 'org_id', referencedColumnName: 'id' })
  organization: Organization;
}

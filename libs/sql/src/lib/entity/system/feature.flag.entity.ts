import { Column, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity({ name: 'FeatureFlags' })
export class FeatureFlag {
  @PrimaryColumn('text', { name: 'flag_id' })
  flagId: string;

  @PrimaryColumn('int', { name: 'org_id' })
  orgId: number;

  @Column('bit', { name: 'flag_state' })
  flagState: boolean;

  @Column('int', { name: 'modifier_user_id' })
  modifierUserId: number;

  @UpdateDateColumn({ name: 'update_date_time' })
  updateDateTime: Date;

  @ManyToOne(() => Organization, (org) => org.id)
  organization: Organization;
}

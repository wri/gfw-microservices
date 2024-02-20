import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('FeatureFlags')
export class FeatureFlags {
  @PrimaryColumn('text', { name: 'flag_id' })
  flagId: string;

  @PrimaryColumn('int', { name: 'org_id' })
  orgId: number | null;

  @Column('bit', { name: 'flag_state' })
  flagState: boolean;

  @Column('int', { name: 'modifier_user_id' })
  modifierUserId: number;

  @Column('date', { name: 'update_date_time' })
  updateDateTime: Date;
}

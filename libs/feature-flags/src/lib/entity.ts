import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('FeatureFlags')
export class FeatureFlags {
  @PrimaryColumn('text', { name: 'flag_id' })
  flagId: string;

  @PrimaryColumn('number', {
    name: 'org_id',
    nullable: false,
  })
  orgId: number | null;

  @Column('boolean', { name: 'flag_state' })
  flagState: boolean;

  @Column('number', { name: 'modifier_user_id' })
  modifierUserId: number;

  @Column('date', { name: 'update_date_time' })
  updateDateTime: Date;
}

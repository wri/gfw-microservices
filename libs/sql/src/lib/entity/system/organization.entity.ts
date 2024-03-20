import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { FeatureFlag } from './feature.flag.entity';

@Entity({ name: 'Organizations' })
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'organization_name' })
  organizationName: string;

  @Column({ name: 'organization_db' })
  organizationDb: string;

  @Column({ name: 'organization_status_id' })
  organizationStatusId: number;

  @Column({ name: 'organization_activated_time' })
  organizationActivatedTime: number;

  @Column({ name: 'subscription_status_id' })
  subscriptionStatusId: number;

  @OneToMany(() => FeatureFlag, (featureFlag) => featureFlag.orgId)
  featureFlags: FeatureFlag[];
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';
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
  organizationActivatedTime: Date;

  // @Column({ name: 'renewal_time' })
  // renewalTime: Date;

  @Column({ name: 'subscription_status_id' })
  subscriptionStatusId: number;

  @OneToMany(() => FeatureFlag, (featureFlag) => featureFlag.orgId)
  @JoinColumn({ name: 'org_id' })
  featureFlags: FeatureFlag[];
}

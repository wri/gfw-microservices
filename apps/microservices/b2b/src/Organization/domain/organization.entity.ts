import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ name: 'renewal_time' })
  renewalTime: Date;

  @Column({ name: 'subscription_status_id' })
  subscriptionStatusId: number;
}

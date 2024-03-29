import { Entity, Column, PrimaryColumn, OneToMany, JoinColumn } from 'typeorm';
import { ExternalAPIKey } from './external-api-key.entity';

@Entity({ name: 'UserRoutes' })
export class UserRoutes {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'user_email' })
  user_email: string;

  @Column({ name: 'organization_id' })
  organization_id: number;

  @Column({ name: 'organization_user_id' })
  organization_user_id: number;

  @Column({ name: 'organization_user_status_id' })
  organization_user_status_id: number;

  @OneToMany(() => ExternalAPIKey, (token) => token.user)
  @JoinColumn([
    { name: 'creatorUserId', referencedColumnName: 'organization_user_id' },
    { name: 'organizationId', referencedColumnName: 'organization_id' },
  ])
  tokens: ExternalAPIKey[];
}

import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserRoutes } from './user-route.entity';

@Entity({ name: 'ExternalAPIKeys' })
export class ExternalAPIKey {
  @PrimaryColumn()
  awsId: string;

  @Column()
  organizationId: number;

  @Column()
  creatorUserId: number;

  @Column()
  apiKey: string;

  @Column()
  apiGroups: string;

  @Column({ nullable: true })
  updateDateTime: Date;

  @ManyToOne(() => UserRoutes, (user) => user.tokens, { eager: true })
  @JoinColumn({ name: 'creatorUserId', referencedColumnName: 'organization_user_id' }) // Specify the foreign key column
  user: UserRoutes;
}

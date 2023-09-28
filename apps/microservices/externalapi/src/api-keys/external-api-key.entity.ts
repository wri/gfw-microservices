import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'ExternalApiKey' })
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
  apiGroup: string;

  @Column({ nullable: true })
  updateDateTime: Date;

  @ManyToOne(() => User, (user) => user.tokens, { eager: true })
  @JoinColumn({ name: 'creatorUserId', referencedColumnName: 'id' }) // Specify the foreign key column
  user: User;
}

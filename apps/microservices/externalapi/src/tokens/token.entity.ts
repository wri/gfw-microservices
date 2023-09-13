import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'ExternalApiKey' })
export class Token {
  @PrimaryColumn()
  id: string;

  @Column()
  organizationId: number;

  @Column()
  creatorUserId: number;

  @Column()
  apiKey: string;

  @Column()
  apiGroup: string;

  @Column()
  createdDateTime: Date;

  @Column({ nullable: true })
  updateDateTime?: Date;

  @Column({ nullable: true })
  deletedDateTime?: Date;

  @ManyToOne(() => User, (user) => user.tokens, { eager: true })
  user: User;
}

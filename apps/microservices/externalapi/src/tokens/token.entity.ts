import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Token {
  @PrimaryColumn()
  id: string;

  @Column()
  organizationId: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  tokenValue: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;

  @Column({ nullable: true })
  deletedAt?: Date;
}
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FeatureFlags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  flagId: string;

  @Column({ nullable: true })
  orgId: number;

  @Column()
  flagState: boolean;

  @Column()
  modifierUserId: number;

  @Column()
  updateDateTime: Date;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'ActivityLog' })
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'activity_type_id' })
  activityTypeId: number;

  @Column({ name: 'activity_description' })
  activityDescription: string;

  @Column({ name: 'activity_time' })
  activityTime: Date;
}

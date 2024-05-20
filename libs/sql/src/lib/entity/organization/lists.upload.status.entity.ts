import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'ListsUploadStatus' })
export class ListsUploadStatus {
  @PrimaryGeneratedColumn({ name: 'list_id' })
  listId: number;

  @Column({ name: 'last_successful_stage' })
  lastSuccessfulStage: string;

  @Column({ name: 'error_info' })
  errorInfo: string;

  @Column({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'worker_instance_id' })
  workerInstanceId: string;
}

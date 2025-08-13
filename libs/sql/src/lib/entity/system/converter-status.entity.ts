import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

type ConverterRunMode = 'GLOBAL' | 'TARGETED' | 'CONTINUE';

@Entity({ name: 'ConverterStatus' })
export class ConverterStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'nvarchar', length: 32 })
  name: string;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'finish_time', type: 'datetime', nullable: true })
  finishTime: Date;

  @Column({ name: 'status', type: 'nvarchar', length: 32, nullable: true })
  status: string;

  @Column({ name: 'organization_id', type: 'int', nullable: true })
  organizationId: number;

  @Column({ name: 'list_id', type: 'int', nullable: true })
  listId: number;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @Column({ name: 'error_details', type: 'nvarchar', nullable: true })
  errorDetails: string;

  @Column({ name: 'run_mode', type: 'nvarchar', length: 32, nullable: true })
  mode: ConverterRunMode;

  @Column({ name: 'dry_run', nullable: true })
  isDryRun: boolean;

  @Column({ name: 'total_lists_affected', type: 'int', nullable: true })
  totalListsAffected: number | null;
}

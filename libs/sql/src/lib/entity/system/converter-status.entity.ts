import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'ConverterStatus' })
export class ConverterStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'nvarchar', length: 32 })
  name: string;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

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
}

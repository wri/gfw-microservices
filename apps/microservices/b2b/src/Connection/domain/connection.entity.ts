import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Connection_Request')
export class ConnectionRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_source_organization' })
  idSourceOrganization: number;

  @Column({ name: 'id_target_organization' })
  idTargetOrganization: number;

  @Column({ name: 'create_date' })
  createDate: Date;

  @Column({ name: 'source_email' })
  sourceEmail: string;

  @Column({ name: 'initial_target_email' })
  initialTargetEmail: string;
}

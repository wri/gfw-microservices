import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ConnectionRequest } from './connection.entity';

@Entity('Connection_Status')
export class ConnectionStatus {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'id_status' })
  idStatus: number;

  @ManyToOne(
    () => ConnectionRequest,
    (connectionRequest) => connectionRequest.id,
  )
  @JoinColumn({ name: 'id_connection_request' })
  connectionRequest: ConnectionRequest;

  @Column({ name: 'editor_email' })
  editorEmail: string;

  @Column({ name: 'edited_date' })
  editedDate: Date;
}

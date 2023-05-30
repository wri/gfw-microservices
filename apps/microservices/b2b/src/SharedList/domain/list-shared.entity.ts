import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Connection_Shared_List')
export class ListShared {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_connection_request' })
  idConnectionRequest: number;

  @Column({ name: 'id_list' })
  idList: number;

  @Column({ name: 'edited_date' })
  editedDate: Date;

  @Column({ name: 'shared_with_geometry' })
  sharedWithGeometry: boolean;

  @Column()
  enabled: boolean;
}

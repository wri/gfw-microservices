import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class SharedListEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  id_connection_request: Date;
  @Column()
  id_list: string;
  @Column()
  edited_date: string;
  @Column()
  shared_with_geometry: boolean;
  @Column()
  enabled: boolean;
}

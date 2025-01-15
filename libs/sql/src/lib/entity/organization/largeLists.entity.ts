import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'LargeLists' })
export class LargeLists {
  @PrimaryGeneratedColumn({ name: 'large_list_id' })
  largeListsId: number;

  @Column({ name: 'list_id' })
  listId: number;

  @Column({ name: 'organization_user_id' })
  organizationUserId: number;

  @Column({ name: 'list_name' })
  listName: number;

  @Column({ name: 's3_filename' })
  s3Filename: number;

  @Column({ name: 's3_location' })
  s3Location: number;

  @Column({ name: 'list_status' })
  listStatus: number;

  @Column({ name: 'creation_date' })
  creationDate: number;

  @Column({ name: 'modification_date' })
  modificationDate: number;
}

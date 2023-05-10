import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ConnectionEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  createDate: Date;
  @Column()
  sourceOrganization: string;
  @Column()
  targetOrganization: string;
  @Column()
  sourceEmail: string;
  @Column()
  editorEmail: string;
  @Column()
  editedDate: Date;
  @Column()
  status: string;
  @Column()
  description: string;
}

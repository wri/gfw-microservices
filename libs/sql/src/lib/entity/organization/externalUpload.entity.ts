import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ExternalUploads' })
export class ExternalUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  uploadKeyFile: string;

  @Column()
  uploadUrl: string;

  @Column()
  uploadDateTime: Date;
}

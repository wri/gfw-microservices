import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Templates' })
export class ListTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'location_type_id' })
  locationTypeId: number;

  @Column({ name: 'template_name', length: 50 })
  templateName: string;
}

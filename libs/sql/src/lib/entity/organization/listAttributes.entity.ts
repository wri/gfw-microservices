import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ListAttributes' })
export class ListAttributes {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'list_id' })
  list_id: number;

  @Column({ name: 'attribute_name' })
  attribute_name: string;

  @Column({ name: 'attribute_type' })
  attribute_type: number;
}

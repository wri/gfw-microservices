import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ListAttributes' })
export class ListAttributes {
  @PrimaryColumn({ name: 'list_id' })
  list_id: number;

  @PrimaryColumn({ name: 'attribute_name' })
  attribute_name: string;

  @Column({ name: 'attribute_type' })
  attribute_type: number;
}

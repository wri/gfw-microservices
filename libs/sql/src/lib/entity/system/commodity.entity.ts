import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Commodities' })
export class Commodity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'commmodity_name', length: 30 })
  commodityName: string;
}

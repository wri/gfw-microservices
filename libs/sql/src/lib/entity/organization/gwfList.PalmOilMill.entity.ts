import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'list-palmOilMills' })
export class ListsPalmOilMills {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'location_id' })
  locationId: number;

  @Column({ name: 'Location Name' })
  'Location Name': string;

  @Column({ name: 'Analysis Radius' })
  'Analysis Radius': number;

  @Column({ name: 'Size' })
  'Size': number;

  @Column({ name: 'Parent Company' })
  'Parent Company': string;

  @Column({ name: 'Company ID' })
  'Company ID': string;

  @Column({ name: 'Certification' })
  Certification: string;

  @Column({ name: 'RSPO Model' })
  'RSPO Model': string;

  @Column({ name: 'Latitude' })
  Latitude: number;

  @Column({ name: 'Longitude' })
  Longitude: number;

  @Column({ name: 'Location Classification' })
  'Location Classification': string;

  @Column({ name: 'Commodity' })
  Commodity: string;

  @Column({ name: 'Country' })
  Country: string;

  @Column({ name: 'State' })
  State: string;

  @Column({ name: 'Sub State' })
  'Sub State': string;

  @Column({ name: 'gadmid' })
  gadmid: string;

  @Column({ name: 'Group Name' })
  'Group Name': string;

  @Column({ name: 'Mill ID' })
  'Mill ID': string;

  @Column({ name: 'Alternative Name' })
  'Alternative Name': string;

  @Column({ name: 'Geometry' })
  'Geometry': string;

  @Column({ name: 'Geometry Simplified' })
  'Geometry Simplified': string;

  @Column({ name: 'globalid' })
  globalid: string;
}

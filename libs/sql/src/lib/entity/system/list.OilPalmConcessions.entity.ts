import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'list-oilPalmConcessions' })
export class ListOilPalmConcessions {
  @Column({ name: 'Location Name' })
  'Location Name': string;

  @Column({ name: 'Latitude' })
  Latitude: number;

  @Column({ name: 'Longitude' })
  Longitude: number;

  @Column({ name: 'Country' })
  Country: string;

  @Column({ name: 'Company' })
  Company: string;

  @Column({ name: 'Analysis Area' })
  'Analysis Area': number;

  @Column({ name: 'Parent Company' })
  'Parent Company': string;

  @Column({ name: 'Certification' })
  Certification: string;

  @Column({ name: 'Location Classification' })
  'Location Classification': string;

  @Column({ name: 'Commodity' })
  Commodity: string;

  @Column({ name: 'State' })
  State: string;

  @Column({ name: 'Sub State' })
  'Sub State': string;

  @Column({ name: 'gadmid' })
  gadmid: string;

  @Column({ name: 'globalid' })
  globalid: string;

  @Column({ name: 'Geometry' })
  'Geometry': string;

  @PrimaryColumn({ name: 'location_id' })
  location_id: number;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'list-administrativeAreas' })
export class ListAdministrativeAreas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Location Name' })
  'Location Name': string;

  @Column({ name: 'Country' })
  Country: string;

  @Column({ name: 'State' })
  State: string;

  @Column({ name: 'Sub State' })
  'Sub State': string;

  @Column({ name: 'gadmid' })
  gadmid: string;

  @Column({ name: 'Latitude' })
  Latitude: number;

  @Column({ name: 'Longitude' })
  Longitude: number;

  @Column({ name: 'Location Classification' })
  'Location Classification': string;

  @Column({ name: 'Size' })
  'Size': number;

  @Column({ name: 'Geometry' })
  'Geometry': string;

  @Column({ name: 'location_id' })
  location_id: number;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'list-protectedAreas' })
export class ListProtectedAreas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'Location Name' })
  LocationName: string;

  @Column({ name: 'Latitude' })
  Latitude: number;

  @Column({ name: 'Longitude' })
  Longitude: number;

  @Column({ name: 'Country' })
  Country: string;

  @Column({ name: 'State' })
  State: string;

  @Column({ name: 'Sub State' })
  'Sub State': string;

  @Column({ name: 'Size' })
  'Size': number;

  @Column({ name: 'IUCN CAT' })
  'IUCN CAT': string;

  @Column({ name: 'Designation Type' })
  'Designation Type': string;

  @Column({ name: 'Designation' })
  Designation: string;

  @Column({ name: 'Location Classification' })
  'Location Classification': string;

  @Column({ name: 'gadmid' })
  gadmid: string;

  @Column({ name: 'globalid' })
  globalid: string;

  @Column({ name: 'WDPAID' })
  WDPAID: number;

  @Column({ name: 'WDPA_PID' })
  WDPA_PID: string;

  @Column({ name: 'Geometry' })
  'Geometry': string;

  @Column({ name: 'location_id' })
  location_id: number;
}

import { Column, Entity } from 'typeorm';

@Entity({ name: 'list-administrativeAreas41' })
export class ListAdministrativeAreas {
  @Column({ name: 'location_id' })
  location_id: number;

  @Column({ name: 'Location Name' })
  LocationName: string;

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

  @Column({ name: 'ErrorDetails' })
  'ErrorDetails': string;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'list-palmOilMills' })
export class ListsPalmOilMills {

  @Column({ name: 'Location Name' })
  locationName: string;

  @Column({ name: 'Analysis Radius' })
  analysisRadis: number;

  @Column({ name: 'Size' })
  size: number;

  @Column({ name: 'Parent Company' })
  parentCompany: string;

  @Column({ name: 'Company ID' })
  companyId: string;

  @Column({ name: 'Certification' })
  certification: string;

  @Column({ name: 'RSPO Model' })
  rspoMode: number;

  @Column({ name: 'Latitude'})
  latitude: number;

  @Column({ name: 'Longitude' })
  longitude: number;

  @Column({ name: 'Location Classification'})
  locationClassification: string;

  @Column({ name: 'Commodity'})
  commodity: string;

  @Column({ name: 'Country' })
  country: string;

  @Column({ name: 'State' })
  state: string;

  @Column({ name: 'Sub State' })
  subState: string;

  @Column({ name: 'gadmid' })
  gadmId: string;

  @Column({ name: 'Group Name' })
  groupName: string;

  @Column({ name: 'Mill ID'})
  millId: string;

  @Column({ name: 'Alternative Name' })
  alternativeName: string;

  @Column({ name: 'Geometry' })
  errorFileStoragePath: string;

  @Column({ name: 'Geometry Simplified' })
  vectorTilesLastUpdated: string;

  @Column({ name: 'globalid' })
  globalId: string;

  @Column({ name: 'location_id' })
  locationId: number;

  @Column({ name: 'id' })
  id: number;

}

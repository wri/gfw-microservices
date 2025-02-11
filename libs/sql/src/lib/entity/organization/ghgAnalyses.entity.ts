import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'GHGAnalyses' })
export class GHGAnalyses {
  @PrimaryGeneratedColumn({ name: 'list_id' })
  listId: number;

  @PrimaryGeneratedColumn({ name: 'location_id' })
  locationId: number;

  @Column({ name: 'total_area_ha', type: 'float' })
  totalAreaHa: number;

  @Column({ name: 'status_code' })
  statusCode: number;

  @Column({ name: 'location_error' })
  locationError: string;

  @Column({ name: 'emissions_factor_by_year' })
  emissionsFactorByYear: string;
}

import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'GHGAnalyses' })
@Unique(['listId', 'locationId'])
export class GHGAnalyses {
  @Column({ name: 'list_id' })
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

  @Column({ name: 'ef_co2_by_year' })
  efCo2ByYear: string;

  @Column({ name: 'ef_ch4_by_year' })
  efCh4ByYear: string;

  @Column({ name: 'ef_n2o_by_year' })
  efN2oByYear: string;
}

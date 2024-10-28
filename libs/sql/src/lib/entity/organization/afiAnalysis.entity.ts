import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'AFIAnalysis' })
export class AFIAnalysis {
  @PrimaryGeneratedColumn({ name: 'list_id' })
  list_id: number;
  @Column({ name: 'location_id' })
  location_id: number;
  @Column({ name: 'gadm_id' })
  gadm_id: string;
  @Column({ name: 'natural_land_area' })
  natural_land_area: number;
  @Column({ name: 'natural_land_deforested_area' })
  natural_land_deforested_area: number;
  @Column({ name: 'total_area_ha' })
  total_area_ha: number;
  @Column({ name: 'status_code' })
  status_code: number;
  @Column({ name: 'location_error' })
  location_error: string;
  @Column({ name: 'negligible_risk' })
  negligible_risk: number;
  @Column({ name: 'jrc_land_area' })
  jrc_land_area: number;
  @Column({ name: 'jrc_land_deforested_area' })
  jrc_land_deforested_area: number;
  @Column({ name: 'jrc_forest_loss_by_year' })
  jrc_forest_loss_by_year: string;
  @Column({ name: 'natural_forest_loss_by_year' })
  natural_forest_loss_by_year: string;
  @Column({ name: 'protected_areas_area' })
  protected_areas_area: number;
  @Column({ name: 'landmark_area' })
  landmark_area: number;
}

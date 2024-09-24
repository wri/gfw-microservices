import { Column, Entity } from 'typeorm';
import { BaseGfwAnalysis } from './BaseGfwAnalysis';

@Entity({ name: 'analysis-oilPalmConcessions' })
export class AnalysisOilPalmConcessions extends BaseGfwAnalysis {
  @Column({ name: 'tree_cover_loss_arg_otbn_yearly' })
  'tree_cover_loss_arg_otbn_yearly': string;

  @Column({ name: 'arg_otbn_area' })
  'arg_otbn_area': string;

  @Column({ name: 'argentina_presence' })
  'argentina_presence': string;

  @Column({ name: 'protected_areas_by_category_area' })
  'protected_areas_by_category_area': string;

  @Column({ name: 'landmark_by_category_area' })
  'landmark_by_category_area': string;

  @Column({ name: 'country_specific_deforestation_yearly' })
  'country_specific_deforestation_yearly': string;

  @Column({ name: 'country_specific_deforestation_wdpa_yearly' })
  'country_specific_deforestation_wdpa_yearly': string;

  @Column({ name: 'country_specific_deforestation_landmark_yearly' })
  'country_specific_deforestation_landmark_yearly': string;

  @Column({ name: 'country_specific_deforestation_classified_region_yearly' })
  'country_specific_deforestation_classified_region_yearly': string;

  @Column({ name: 'tree_cover_loss_by_country_yearly' })
  'tree_cover_loss_by_country_yearly': string;

  @Column({ name: 'tree_cover_loss_by_country_wdpa_yearly' })
  'tree_cover_loss_by_country_wdpa_yearly': string;

  @Column({ name: 'tree_cover_loss_by_country_landmark_yearly' })
  'tree_cover_loss_by_country_landmark_yearly': string;

  @Column({ name: 'country_area' })
  'country_area': string;

  @Column({ name: 'classified_region_area' })
  'classified_region_area': string;

  @Column({ name: 'tree_cover_loss_by_country_classified_region_yearly' })
  'tree_cover_loss_by_country_classified_region_yearly': string;
}

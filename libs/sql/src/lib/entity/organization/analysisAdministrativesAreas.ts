import { Entity, Column } from 'typeorm';
import { BaseGfwAnalysis } from './BaseGfwAnalysis';

@Entity({ name: 'analysis-administrativeAreas' })
export class AnalysisAdministrativesAreas extends BaseGfwAnalysis {
  @Column({ name: 'tree_cover_loss_arg_otbn_yearly' })
  'tree_cover_loss_arg_otbn_yearly': string;

  @Column({ name: 'arg_otbn_area' })
  'arg_otbn_area': string;

  @Column({ name: 'argentina_presence' })
  'argentina_presence': string;
}

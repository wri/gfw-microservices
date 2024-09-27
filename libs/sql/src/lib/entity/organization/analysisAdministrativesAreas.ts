import { Entity, Column } from 'typeorm';
import { BaseGfwAnalysis } from './BaseGfwAnalysis';

@Entity({ name: 'analysis-administrativeAreas' })
export class AnalysisAdministrativesAreas extends BaseGfwAnalysis {}

import { Entity } from 'typeorm';
import { BaseGfwAnalysis } from './BaseGfwAnalysis';

@Entity({ name: 'analysis-protectedAreas' })
export class AnalysisProtectedAreas extends BaseGfwAnalysis {}

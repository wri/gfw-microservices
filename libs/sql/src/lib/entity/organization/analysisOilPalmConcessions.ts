import { Column, Entity } from 'typeorm';
import { BaseGfwAnalysis } from './BaseGfwAnalysis';

@Entity({ name: 'analysis-oilPalmConcessions' })
export class AnalysisOilPalmConcessions extends BaseGfwAnalysis {}

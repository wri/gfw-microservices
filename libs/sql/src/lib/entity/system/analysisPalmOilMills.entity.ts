import { Entity } from 'typeorm';
import { BaseGfwAnalysis } from './BaseGfwAnalysis';

@Entity({ name: 'analysis-palmOilMills' })
export class AnalysisPalmOilMills extends BaseGfwAnalysis {}

import { Injectable, Inject, Logger } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from './IPipeService';

import { ForestLossService } from '../files/forest.loss.service';
import { HistoricPercentService } from '../files/historic.percent.service';
import { ForestChangeDiagnosticLocationSummaryService } from '../files/forest.change.diagnostic.location.summary.service';
import { ForestChangeDiagnosticListSummaryService } from '../files/forest.change.diagnostic.list.summary.service';
import { CommodityRiskDiagnosticLocationSummaryService } from '../files/commodity.risk.diagnostic.location.summary.service';
import { DeforestationTrendsService } from '../files/deforestation.trends.service';
import { MillPriorityService } from '../files/mill.priority.service';
import { PalmRiskAnalysisService } from '../files/palm.risk.analysis.service';
import { SouthAmericaBiomesService } from '../files/south.america.biomes.service';
import { SouthAmericaLossService } from '../files/south.america.loss.service';
import { SouthEastAsiaOverlapService } from '../files/south.east.asia.overlap.service';
import { SouthEastAsiaTCLService } from '../files/south.east.asia.tcl.service';
import { getAllFilesAndZip } from '../shared/file.utils';
import { ArgentinaOverlap } from '../files/argentina.overlap';

@Injectable()
export class DashboardService extends IPipeService {
  private readonly logger = new Logger(DashboardService.name);

  @Inject(ForestLossService)
  private readonly forestLoos: ForestLossService;

  @Inject(HistoricPercentService)
  private readonly historicPercentService: HistoricPercentService;

  @Inject(ForestChangeDiagnosticLocationSummaryService)
  private readonly forestChangeDiagnosticLocationSummaryService: ForestChangeDiagnosticLocationSummaryService;

  @Inject(ForestChangeDiagnosticListSummaryService)
  private readonly forestChangeDiagnosticListSummaryService: ForestChangeDiagnosticListSummaryService;

  @Inject(CommodityRiskDiagnosticLocationSummaryService)
  private readonly commodityRiskDiagnosticLocationSummaryService: CommodityRiskDiagnosticLocationSummaryService;

  @Inject(DeforestationTrendsService)
  private readonly deforestationTrendsService: DeforestationTrendsService;

  @Inject(MillPriorityService)
  private readonly millPriorityService: MillPriorityService;

  @Inject(PalmRiskAnalysisService)
  private readonly palmRiskAnalysisService: PalmRiskAnalysisService;

  @Inject(SouthAmericaBiomesService)
  private readonly southAmericaBiomesService: SouthAmericaBiomesService;

  @Inject(SouthAmericaLossService)
  private readonly southAmericaLossService: SouthAmericaLossService;

  @Inject(SouthEastAsiaOverlapService)
  private readonly southEastAsiaOverlapService: SouthEastAsiaOverlapService;

  @Inject(SouthEastAsiaTCLService)
  private readonly southEastAsiaTCLService: SouthEastAsiaTCLService;

  @Inject(ArgentinaOverlap)
  private readonly argentinaOverlap: ArgentinaOverlap;

  start(filters: GenerationFileRequest) {
    this.startEmail(filters);

    this.forestLoos.start(filters);
    this.historicPercentService.start(filters);
    this.forestChangeDiagnosticLocationSummaryService.start(filters);
    this.forestChangeDiagnosticListSummaryService.start(filters);
    this.commodityRiskDiagnosticLocationSummaryService.start(filters);
    this.deforestationTrendsService.start(filters);
    this.millPriorityService.start(filters);
    this.palmRiskAnalysisService.start(filters);
    this.southAmericaBiomesService.start(filters);
    this.southAmericaLossService.start(filters);
    this.southEastAsiaOverlapService.start(filters);
    this.southEastAsiaTCLService.start(filters);
    this.argentinaOverlap.start(filters);
  }

  process(data, filters: GenerationFileRequest) {
    this.forestLoos.process(data, filters);
    this.historicPercentService.process(data, filters);
    this.forestChangeDiagnosticLocationSummaryService.process(data, filters);
    this.forestChangeDiagnosticListSummaryService.process(data, filters);
    this.commodityRiskDiagnosticLocationSummaryService.process(data, filters);
    this.deforestationTrendsService.process(data, filters);
    this.millPriorityService.process(data, filters);
    this.palmRiskAnalysisService.process(data, filters);
    this.southAmericaBiomesService.process(data, filters);
    this.southAmericaLossService.process(data, filters);
    this.southEastAsiaOverlapService.process(data, filters);
    this.southEastAsiaTCLService.process(data, filters);
    this.argentinaOverlap.start(filters);
  }

  async finish(filters: GenerationFileRequest) {
    const { key } = filters;

    this.logger.log(`(${key}) - Waiting all stream to finish`);
    await this.forestLoos.finish(filters);
    await this.historicPercentService.finish(filters);
    await this.forestChangeDiagnosticLocationSummaryService.finish(filters);
    await this.forestChangeDiagnosticListSummaryService.finish(filters);
    await this.commodityRiskDiagnosticLocationSummaryService.finish(filters);
    await this.deforestationTrendsService.finish(filters);
    await this.millPriorityService.finish(filters);
    await this.palmRiskAnalysisService.finish(filters);
    await this.southAmericaBiomesService.finish(filters);
    await this.southAmericaLossService.finish(filters);
    await this.southEastAsiaOverlapService.finish(filters);
    await this.southEastAsiaTCLService.finish(filters);
    await this.argentinaOverlap.finish(filters);

    this.logger.log(`(${key}) - Zipping files`);
    await getAllFilesAndZip(filters);
    this.finishProcess(filters);
  }
}

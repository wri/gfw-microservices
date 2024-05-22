import { Injectable, Inject, Logger } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from './i.pipe.service';

import {
  ArgentinaLossOfForestsAggregateService,
  ArgentinaLossOfForestsService,
  ArgentinaOverlapService,
  CommodityRiskDiagnosticLocationSummaryService,
  DeforestationTrendsService,
  ForestChangeDiagnosticListSummaryService,
  ForestChangeDiagnosticLocationSummaryService,
  ForestLossService,
  HistoricPercentService,
  MillPriorityService,
  PalmRiskAnalysisService,
  SouthAmericaBiomesService,
  SouthAmericaLossService,
  SouthEastAsiaOverlapService,
  SouthEastAsiaTCLService,
} from '../files';

import { getAllFilesAndZip } from '../shared/file.utils';

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

  @Inject(ArgentinaOverlapService)
  private readonly argentinaOverlap: ArgentinaOverlapService;

  @Inject(ArgentinaLossOfForestsService)
  private readonly argentinaLossOfForests: ArgentinaLossOfForestsService;

  @Inject(ArgentinaLossOfForestsAggregateService)
  private readonly argentinaLossOfForestsAggregate: ArgentinaLossOfForestsAggregateService;

  async start(filters: ListFieldsFileRequest) {
    await this.startEmail(filters);

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
    this.argentinaLossOfForests.start(filters);
    this.argentinaLossOfForestsAggregate.start(filters);
  }

  process(data, filters: ListFieldsFileRequest) {
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
    this.argentinaOverlap.process(data, filters);
    this.argentinaLossOfForests.process(data, filters);
    this.argentinaLossOfForestsAggregate.process(data, filters);
  }

  async finish(filters: ListFieldsFileRequest) {
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
    await this.argentinaLossOfForests.finish(filters);
    await this.argentinaLossOfForestsAggregate.finish(filters);

    this.logger.log(`(${key}) - Zipping files`);
    await getAllFilesAndZip(filters);
    await this.finishProcess(filters);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ListFieldsFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from './i.pipe.service';

import {
  ArgentinaDeforestationService,
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
  ColombiaOverlapService,
  ColombiaDeforestationService,
} from '../files';

import { getAllFilesAndZip } from '../shared/file.utils';

@Injectable()
export class DashboardService extends IPipeService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly forestLoss: ForestLossService,
    private readonly historicPercentService: HistoricPercentService,
    private readonly forestChangeDiagnosticLocationSummaryService: ForestChangeDiagnosticLocationSummaryService,
    private readonly forestChangeDiagnosticListSummaryService: ForestChangeDiagnosticListSummaryService,
    private readonly commodityRiskDiagnosticLocationSummaryService: CommodityRiskDiagnosticLocationSummaryService,
    private readonly deforestationTrendsService: DeforestationTrendsService,
    private readonly millPriorityService: MillPriorityService,
    private readonly palmRiskAnalysisService: PalmRiskAnalysisService,
    private readonly southAmericaBiomesService: SouthAmericaBiomesService,
    private readonly southAmericaLossService: SouthAmericaLossService,
    private readonly southEastAsiaOverlapService: SouthEastAsiaOverlapService,
    private readonly southEastAsiaTCLService: SouthEastAsiaTCLService,
    private readonly argentinaOverlap: ArgentinaOverlapService,
    private readonly argentinaDeforestation: ArgentinaDeforestationService,
    private readonly colombiaOverlapService: ColombiaOverlapService,
    private readonly colombiaDeforestationService: ColombiaDeforestationService
  ) {
    super();
  }

  async start(filters: ListFieldsFileRequest) {
    await this.startEmail(filters);

    this.forestLoss.start(filters);
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
    this.argentinaDeforestation.start(filters);
    this.colombiaOverlapService.start(filters);
    this.colombiaDeforestationService.start(filters);
  }

  async process(data, filters: ListFieldsFileRequest) {
    this.forestLoss.process(data, filters);
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
    this.argentinaDeforestation.process(data, filters);
    this.colombiaOverlapService.process(data, filters);
    this.colombiaDeforestationService.process(data, filters);
  }

  async finish(filters: ListFieldsFileRequest) {
    const { key } = filters;

    this.logger.log(`(${key}) - Waiting all streams to finish`);
    await this.forestLoss.finish(filters);
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
    await this.argentinaDeforestation.finish(filters);
    await this.colombiaOverlapService.finish(filters);
    await this.colombiaDeforestationService.finish(filters);

    this.logger.log(`(${key}) - Zipping files`);
    await getAllFilesAndZip(filters);
    await this.finishProcess(filters);
  }
}

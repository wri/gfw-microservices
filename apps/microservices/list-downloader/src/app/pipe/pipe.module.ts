import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const envModule = ConfigModule.forRoot({
  isGlobal: true,
});

import { PipeService } from './pipe.service';
import { InputService } from '../files/input.service';
import { AwsModule } from '@wri-monorepos/aws';
import { SqlModule } from '@wri-monorepos/sql';
import { ShapefileService } from '../files/shapefile.service';
import { ResultService } from '../files/result.service';
import { DashboardService } from './dashboard.service';
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
import { ListService } from './list.service';
import { AfiService } from './afi.service';
import { AfiFileService } from '../files/afi.file.service';

@Module({
  imports: [envModule, AwsModule, SqlModule],
  providers: [
    CommodityRiskDiagnosticLocationSummaryService,
    DashboardService,
    DeforestationTrendsService,
    ForestChangeDiagnosticListSummaryService,
    ForestChangeDiagnosticLocationSummaryService,
    ForestLossService,
    HistoricPercentService,
    InputService,
    MillPriorityService,
    PalmRiskAnalysisService,
    PipeService,
    ResultService,
    ShapefileService,
    SouthAmericaBiomesService,
    SouthAmericaLossService,
    SouthEastAsiaOverlapService,
    SouthEastAsiaTCLService,
    ListService,
    AfiService,
    AfiFileService,
  ],
  exports: [PipeService],
})
export class PipeModule {}

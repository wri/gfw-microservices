import { Module } from '@nestjs/common';

import { PipeService } from './pipe.service';
import { InputService } from './input.service';
import { AwsModule } from '@wri-monorepos/aws';
import { SqlModule } from '@wri-monorepos/sql';
import { ShapefileService } from './shapefile.service';
import { ResultService } from './result.service';
import { DashboardService } from './dashboard.service';
import { ForestLossService } from './forest.loss.service';
import { HistoricPercentService } from './historic.percent.service';
import { ForestChangeSummaryService } from './forest.change.summary.service';
import { DashboardListLevelService } from './dashboard.list.level.service';

@Module({
  imports: [
    AwsModule,
    SqlModule,
  ],
  providers: [
    DashboardListLevelService,
    DashboardService,
    ForestChangeSummaryService,
    ForestLossService,
    HistoricPercentService,
    InputService,
    PipeService,
    ResultService,
    ShapefileService,
  ],
  exports: [
    PipeService,
  ],
})
export class PipeModule {}

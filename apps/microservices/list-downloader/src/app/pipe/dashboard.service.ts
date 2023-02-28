import * as fs from 'fs';
import * as archiver from 'archiver';
import { Injectable, Inject } from '@nestjs/common';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { IPipeService } from './IPipeService';

import { ForestLossService } from './forest.loss.service';
import { HistoricPercentService } from './historic.percent.service';
import { ForestChangeSummaryService } from './forest.change.summary.service';
import { DashboardListLevelService } from './dashboard.list.level.service';

@Injectable()
export class DashboardService extends IPipeService{

  @Inject(ForestLossService)
  private readonly forestLoos: ForestLossService;

  @Inject(HistoricPercentService)
  private readonly historicPercentService: HistoricPercentService;

  @Inject(ForestChangeSummaryService)
  private readonly forestChangeSummaryService: ForestChangeSummaryService;

  @Inject(DashboardListLevelService)
  private readonly dashboardListLevelService: DashboardListLevelService;

  start(filters: GenerationFileRequest) {
    this.startEmail(filters);

    this.forestLoos.start(filters);
    this.historicPercentService.start(filters);
    this.forestChangeSummaryService.start(filters);

    this.dashboardListLevelService.generateCSV(filters, 'forestLossAggregate','sensitive_areas_loss_of_forests_aggregate');
  }

  process(data: any, filters: GenerationFileRequest) {
    this.forestLoos.process(data, filters);
    this.historicPercentService.process(data, filters);
    this.forestChangeSummaryService.process(data, filters);
  }

  finish(filters: GenerationFileRequest) {
    const { key } = filters;
    this.forestLoos.finish(filters);
    this.historicPercentService.finish(filters);
    this.forestChangeSummaryService.finish(filters);

    const output = fs.createWriteStream(`/tmp/${key}.zip`);

    output.on('close', async () => {
      await this.uploadToS3(filters);
    });


    fs.readdir('/tmp', (err, filenames) => {
      const files = filenames.filter(name => name.includes(`${key}`))


      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      files.forEach(file => {
        archive.append(fs.createReadStream(`/tmp/${file}`), { name: `${file}` });
      });

      archive.pipe(output);
      archive.finalize();
    })
  }
}

import * as fs from 'fs';
import * as readline from 'readline';
import * as archiver from 'archiver';
import { Injectable, Inject } from '@nestjs/common';
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

@Injectable()
export class DashboardService extends IPipeService {
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
  }

  finish(filters: GenerationFileRequest) {
    const { key } = filters;

    this.forestLoos.finish(filters);
    this.historicPercentService.finish(filters);
    this.forestChangeDiagnosticLocationSummaryService.finish();
    this.forestChangeDiagnosticListSummaryService.finish(filters);
    this.commodityRiskDiagnosticLocationSummaryService.finish();
    this.deforestationTrendsService.finish(filters);
    this.millPriorityService.finish(filters);
    this.palmRiskAnalysisService.finish();
    this.southAmericaBiomesService.finish(filters);
    this.southAmericaLossService.finish(filters);
    this.southEastAsiaOverlapService.finish(filters);
    this.southEastAsiaTCLService.finish(filters);

    const output = fs.createWriteStream(`/tmp/${key}.zip`);

    output.on('close', async () => {
      await this.uploadToS3(filters);
    });

    fs.readdir('/tmp', async (err, filenames) => {
      const files = filenames.filter((name) => name.includes(`${key}`));

      new Promise((resolve, reject) => {
        const array = [];
        let count = 1;
        files.forEach((file) => {
          this.getSpecificLine(`/tmp/${file}`, 2, (err, line) => {
            if (err) {
              reject(err);
            }

            if (line.trim() !== '') {
              array.push(file);
            }

            if (files.length === count) {
              resolve(array);
            }
            count += 1;
          });
        });
      }).then((filesToAppend: string[]) => {
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Sets the compression level.
        });
        filesToAppend.forEach((file) => {
          archive.append(fs.createReadStream(`/tmp/${file}`), {
            name: `${file}`,
          });
        });
        archive.pipe(output);
        archive.finalize();
      });
    });
  }

  getSpecificLine(path, row, callback) {
    let i = 0;
    let content = '';
    const rs = fs
      .createReadStream(path, {
        encoding: 'utf8',
        autoClose: false,
      })
      .on('error', function (err) {
        rs.destroy();
        callback(err, content);
      });
    path = null;
    try {
      readline
        .createInterface({
          input: rs,
          terminal: false,
        })
        .on('line', function (line) {
          ++i;
          if (row == i) {
            try {
              content = line;
            } catch (e) {
              console.error(e);
            }
            this.close();
          }
        })
        .on('close', function () {
          rs.destroy();
          callback(null, content);
        })
        .on('error', function (err) {
          rs.destroy();
          callback(err, content);
        });
    } catch (err) {
      console.error(err);
      callback(err, content);
    }
  }
}

import { Logger, Injectable } from '@nestjs/common';
import { AfiGeneratorService } from './afi.generator.service';
import { ListGeneratorService } from './list.generator.service';
import { GenerationFileRequest } from '@wri-monorepos/sql';
import { MAX_NUMBER_OF_ROWS_PER_PAGE } from '../shared/constants';
import * as sql from 'mssql';

import { SQLUtils, ListNameSchema } from '@wri-monorepos/sql';
import { createDirectory } from '../shared/file.utils';
import { AlertsGeneratorService } from './alerts.generator.service';

@Injectable()
export class PipeService {
  private readonly logger = new Logger(PipeService.name);

  constructor(
    private readonly afiGeneratorService: AfiGeneratorService,
    private readonly listGeneratorService: ListGeneratorService,
    private readonly alertsGeneratorService: AlertsGeneratorService
  ) {}

  public async makeFile(filters: GenerationFileRequest) {
    const { type, listId } = filters;

    this.logger.log(`(${listId}) - Receive request to build file for list`);

    const list_name = await this.getListName(filters);

    filters = {
      ...filters,
      listName: list_name,
      rowsPerPage: MAX_NUMBER_OF_ROWS_PER_PAGE,
    };

    this.createDirectory(filters);

    this.getGeneratorBaseOnType()[type].makeFile(filters);
  }

  private async getListName(filters: GenerationFileRequest) {
    const { organizationDatabase, listId } = filters;

    const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
    const { list_name } = await SQLUtils.queryDB<ListNameSchema>(
      organizationDatabase,
      'uspGetListNameSchema',
      parameters
    );
    return list_name;
  }

  private getGeneratorBaseOnType = () => {
    return {
      afi: this.afiGeneratorService,
      alerts: this.alertsGeneratorService,
      argentinaOverlap: this.listGeneratorService,
      commodityRiskDiagnosticLocationSummary: this.listGeneratorService,
      deforestationTrends: this.listGeneratorService,
      everything: this.listGeneratorService,
      forestChangeDiagnosticListSummary: this.listGeneratorService,
      forestChangeDiagnosticLocationSummary: this.listGeneratorService,
      forestLoss: this.listGeneratorService,
      historicPercent: this.listGeneratorService,
      input: this.listGeneratorService,
      millPriority: this.listGeneratorService,
      palmRiskAnalysis: this.listGeneratorService,
      results: this.listGeneratorService,
      southAmericaOverlap: this.listGeneratorService,
      southAmericaTCL: this.listGeneratorService,
      southEastAsiaOverlap: this.listGeneratorService,
      southEastAsiaTCL: this.listGeneratorService,
    };
  };

  private createDirectory = (filters: GenerationFileRequest) => {
    const { listId, key } = filters;

    const dir = `/tmp/wri-${key}`;
    this.logger.log(`(${listId}) - Create directory: ${dir}`);
    createDirectory(dir);
  };
}

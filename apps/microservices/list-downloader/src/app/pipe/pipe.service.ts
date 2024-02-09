import { Logger, Injectable } from '@nestjs/common';
import { AfiGeneratorService } from './afi.generator.service';
import { ListGeneratorService } from './list.generator.service';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { MAX_NUMBER_OF_ROWS_PER_PAGE } from '../shared/constants';
import { ClientStoreConnection, List } from '@wri-monorepos/sql';
import { createDirectory } from '../shared/file.utils';
import { AlertsGeneratorService } from './alerts.generator.service';

@Injectable()
export class PipeService {
  private readonly logger = new Logger(PipeService.name);

  constructor(
    private readonly afiGeneratorService: AfiGeneratorService,
    private readonly listGeneratorService: ListGeneratorService,
    private readonly alertsGeneratorService: AlertsGeneratorService,
    private readonly clientStoreConnection: ClientStoreConnection
  ) {}

  public async makeFile(filters: BasicFieldsFileRequest) {
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

  private async getListName(filters: BasicFieldsFileRequest) {
    const { organizationDatabase, listId } = filters;
    const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
    const listRepository = connection.getRepository(List);
    const { listName } = await listRepository.findOne({ where: { id: listId } });
    return listName;
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

  private createDirectory = (filters: BasicFieldsFileRequest) => {
    const { listId, key } = filters;

    const dir = `/tmp/wri-${key}`;
    this.logger.log(`(${listId}) - Create directory: ${dir}`);
    createDirectory(dir);
  };
}

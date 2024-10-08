import { Logger, Injectable, Scope } from '@nestjs/common';
import { AfiGeneratorService } from './afi.generator.service';
import { ListGeneratorService } from './list.generator.service';
import { BasicFieldsFileRequest, GFWList, ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { MAX_NUMBER_OF_ROWS_PER_PAGE } from '../shared/constants';
import { createDirectory } from '../shared/file.utils';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { AlertsGeneratorService } from './alerts.generator.service';
import { ReadmeService } from '../files/readme.service';
import { InputService, ResultService, ShapefileService } from '../files';

@Injectable({
  scope: Scope.REQUEST,
})
export class PipeService {
  private readonly logger = new Logger(PipeService.name);

  constructor(
    private readonly afiGeneratorService: AfiGeneratorService,
    private readonly listGeneratorService: ListGeneratorService,
    private readonly accountUsersUsageGeneratorService: AccountUsersAnalysisUsageFileService,
    private readonly alertsGeneratorService: AlertsGeneratorService,
    private readonly clientStoreConnection: ClientStoreConnection,
    private readonly readmeService: ReadmeService,
    private readonly shapefileService: ShapefileService,
    private readonly resultService: ResultService,
    private readonly inputService: InputService
  ) {}

  public async makeFile(filters: BasicFieldsFileRequest) {
    const { type, listId } = filters;

    const pipeHandler = this.getGeneratorBaseOnType()[type];

    if (listId) {
      this.logger.log(`Building file for list ID: [${listId}]`);
      const listName = await this.getListName(filters);

      filters = {
        ...filters,
        listName,
        rowsPerPage: MAX_NUMBER_OF_ROWS_PER_PAGE,
      };

      this.createDirectory(filters);
      await this.readmeService.write(filters);
    }

    await pipeHandler.makeFile(filters);
  }

  private async getListName(filters: BasicFieldsFileRequest) {
    const { organizationDatabase, listId, isGFWList } = filters;
    if (!isGFWList) {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
      const listRepository = connection.getRepository(Lists);
      const { listName } = await listRepository.findOne({ where: { id: listId } });
      return listName;
    } else {
      const connection = await this.clientStoreConnection.getConnection('gfwpro', [GFWList]);
      const gfwListRepository = connection.getRepository(GFWList);
      const { listName } = await gfwListRepository.findOne({ where: { id: listId } });
      return listName;
    }
  }

  private getGeneratorBaseOnType = () => {
    return {
      accountUsersUsage: this.accountUsersUsageGeneratorService,
      afi: this.afiGeneratorService,
      alerts: this.alertsGeneratorService,
      argentinaOverlap: this.listGeneratorService,
      argentinaDeforestation: this.listGeneratorService,
      colombia: this.listGeneratorService,
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

  public async makeGeoJsonFile(filters: BasicFieldsFileRequest) {
    await this.shapefileService.start(filters);

    await this.shapefileService.finish(filters);

    return true;
  }
}

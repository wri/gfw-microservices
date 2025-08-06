import { Logger, Injectable, Scope } from '@nestjs/common';
import { AfiGeneratorService } from './afi.generator.service';
import { ListGeneratorService } from './list.generator.service';
import { BasicFieldsFileRequest, GFWList, ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { MAX_NUMBER_OF_ROWS_PER_PAGE } from '../shared/constants';
import { AccountUsersAnalysisUsageFileService } from './account-users-usage.generator.service';
import { AlertsGeneratorService } from './alerts.generator.service';
import { ReadmeService } from '../files/readme.service';
import { createDirectory } from '../shared/file.utils';
import { AfiVcGeneratorService } from './afi.vc.generator.service';
import { GreenHouseGasEmissionsGeneratorService } from './ghg.generator.service';

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
    private readonly afiVcGeneratorService: AfiVcGeneratorService,
    private readonly greenHouseGasEmissionsGeneratorService: GreenHouseGasEmissionsGeneratorService
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

    pipeHandler.makeFile(filters);
  }

  private async getListName(filters: BasicFieldsFileRequest) {
    const { organizationDatabase, listId, isGFWList } = filters;
    try {
      if (!isGFWList) {
        const connection = await this.clientStoreConnection.getConnection(organizationDatabase);
        const listRepository = connection.getRepository(Lists);
        const list = await listRepository.findOne({ where: { id: listId } });
        return list?.listName || '';
      } else {
        const connection = await this.clientStoreConnection.getConnection('gfwpro', [GFWList]);
        const gfwListRepository = connection.getRepository(GFWList);
        const list = await gfwListRepository.findOne({ where: { id: listId } });
        return list?.listName || '';
      }
    } catch (error) {
      this.logger.error(`Error getting list name, listId ${listId}: ${error}`);
      return '';
    }
  }

  private getGeneratorBaseOnType = () => {
    return {
      accountUsersUsage: this.accountUsersUsageGeneratorService,
      afi: this.afiGeneratorService,
      alerts: this.alertsGeneratorService,
      argentina: this.listGeneratorService,
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
      afiVC: this.afiVcGeneratorService,
      ghg: this.greenHouseGasEmissionsGeneratorService,
    };
  };

  private createDirectory = (filters: BasicFieldsFileRequest) => {
    const { listId, key } = filters;

    const dir = `/tmp/wri-${key}`;
    this.logger.log(`(${listId}) - Create directory: ${dir}`);
    createDirectory(dir);
  };
}

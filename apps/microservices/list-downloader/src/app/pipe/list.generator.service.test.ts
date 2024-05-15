import { ListGeneratorService } from './list.generator.service';
import { Test, TestingModule } from '@nestjs/testing';
import { InputService } from '../files/input.service';
import { ShapefileService } from '../files/shapefile.service';
import { DashboardService } from './dashboard.service';
import { ResultService } from '../files/result.service';
import { UspGetListAnalysis } from '@wri-monorepos/sql';
import { AnalysisDataService } from '../data/analysis.data.service';
import * as tsMockito from 'ts-mockito';

describe('ListGeneratorServiceTest', () => {
  let analysisDataService: AnalysisDataService;
  let listGeneratorService: ListGeneratorService;
  let uspGetListAnalysis: UspGetListAnalysis;

  beforeEach(async () => {
    process.env.MSSQL_DATABASE = 'test-db';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListGeneratorService,
        { provide: InputService, useValue: tsMockito.mock(InputService) },
        { provide: ShapefileService, useValue: tsMockito.mock(ShapefileService) },
        { provide: DashboardService, useValue: tsMockito.mock(DashboardService) },
        { provide: ResultService, useValue: tsMockito.mock(ResultService) },
        { provide: UspGetListAnalysis, useValue: tsMockito.mock(UspGetListAnalysis) },
        { provide: AnalysisDataService, useValue: tsMockito.mock(AnalysisDataService) },
      ],
    }).compile();

    listGeneratorService = module.get<ListGeneratorService>(ListGeneratorService);

    analysisDataService = module.get<AnalysisDataService>(AnalysisDataService);
    uspGetListAnalysis = module.get<UspGetListAnalysis>(UspGetListAnalysis);

    jest
      .spyOn(analysisDataService, 'getNumberOfPages')
      .mockImplementation(() => Promise.resolve(4));
    jest
      .spyOn(analysisDataService, 'getDataPaginated')
      .mockImplementation(() => Promise.resolve([]));

    jest.spyOn(uspGetListAnalysis, 'run').mockImplementation(() => Promise.resolve([]));
  });

  it('makeFile when is not gfw list', async () => {
    const mockFilters = {
      organizationDatabase: 'client-db',
      listId: 15,
      combinedColumns: '',
      selectedLocations: '',
      file: 'csv',
      isGFWList: false,
    };

    await listGeneratorService.makeFile(mockFilters);

    expect(analysisDataService.getNumberOfPages).toHaveBeenCalledWith({
      combinedColumns: '',
      file: 'csv',
      isGFWList: false,
      listId: 15,
      organizationDatabase: 'client-db',
      selectedLocations: '',
    });
  });

  it('makeFile when is gfw list', async () => {
    const mockFilters = {
      organizationDatabase: 'client-db',
      listId: 15,
      combinedColumns: '',
      selectedLocations: '',
      file: 'csv',
      isGFWList: true,
    };

    await listGeneratorService.makeFile(mockFilters);

    expect(analysisDataService.getNumberOfPages).toHaveBeenCalledWith({
      combinedColumns: '',
      file: 'csv',
      isGFWList: true,
      listId: 15,
      organizationDatabase: 'test-db',
      selectedLocations: '',
    });
  });
});

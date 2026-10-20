import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import * as tsMockito from 'ts-mockito';
import * as fs from 'fs';

import { UspGetListAnalysis } from '@wri-monorepos/sql';
import { InputService } from '../files/input.service';
import { GeometryService } from '../files/geometry.service';
import { DashboardService } from './dashboard.service';
import { AnalysisDataService } from '../data/analysis.data.service';
import { ListGeneratorService } from './list.generator.service';

describe('ListGeneratorServiceTest', () => {
  let analysisDataService: AnalysisDataService;
  let listGeneratorService: ListGeneratorService;
  let uspGetListAnalysis: UspGetListAnalysis;

  beforeEach(async () => {
    process.env.MSSQL_DATABASE = 'test-db';

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [
        ListGeneratorService,
        { provide: InputService, useValue: tsMockito.mock(InputService) },
        { provide: GeometryService, useValue: tsMockito.mock(GeometryService) },
        { provide: DashboardService, useValue: tsMockito.mock(DashboardService) },
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
      organizationDatabase: 'client-db',
      selectedLocations: '',
    });
  });

  it('makeFile with geojson file requests geometry from the database', async () => {
    const mockFilters = {
      organizationDatabase: 'client-db',
      listId: 15,
      combinedColumns: '',
      selectedLocations: '',
      file: 'geojson',
      isGFWList: false,
    };

    const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
    const geometryService = (listGeneratorService as any).geometryService;
    const startSpy = jest.spyOn(geometryService, 'start').mockResolvedValue(undefined);
    const processSpy = jest.spyOn(geometryService, 'process').mockImplementation(() => undefined);
    const finishSpy = jest.spyOn(geometryService, 'finish').mockResolvedValue(undefined);

    await listGeneratorService.makeFile(mockFilters);

    expect(startSpy).toHaveBeenCalled();
    expect(processSpy).toHaveBeenCalled();
    expect(finishSpy).toHaveBeenCalled();

    const filtersPassed = finishSpy.mock.calls[0][0];
    expect(filtersPassed.geometry).toBe(1);

    writeFileSpy.mockRestore();
    startSpy.mockRestore();
    processSpy.mockRestore();
    finishSpy.mockRestore();
  });
});

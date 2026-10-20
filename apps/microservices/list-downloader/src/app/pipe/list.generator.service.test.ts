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
  let testingModule: TestingModule;

  beforeEach(async () => {
    process.env.MSSQL_DATABASE = 'test-db';

    testingModule = await Test.createTestingModule({
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

    listGeneratorService = testingModule.get<ListGeneratorService>(ListGeneratorService);

    analysisDataService = testingModule.get<AnalysisDataService>(AnalysisDataService);
    uspGetListAnalysis = testingModule.get<UspGetListAnalysis>(UspGetListAnalysis);

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

  it('makeFile with geojson file routes to the geometry service', async () => {
    const geometryServiceInstance = testingModule.get<GeometryService>(GeometryService);

    const geojsonService = (listGeneratorService as any).defineService({
      type: 'input',
      file: 'geojson',
    });
    const shapefileService = (listGeneratorService as any).defineService({
      type: 'input',
      file: 'shapefile',
    });
    const csvService = (listGeneratorService as any).defineService({
      type: 'input',
      file: 'csv',
    });

    expect(geojsonService).toBe(geometryServiceInstance);
    expect(shapefileService).toBe(geometryServiceInstance);
    expect(csvService).not.toBe(geometryServiceInstance);
  });

  it('makeFile with geojson file requests geometry from the database', async () => {
    // makeFile merges `geometry: 1` into filters for geojson/shapefile. The
    // AnalysisDataService mock records what it receives, so assert on it.
    jest
      .spyOn(analysisDataService, 'getDataPaginated')
      .mockImplementation(() => Promise.resolve([{ attributes: '{"SomeAttr":"1"}' } as any]));

    await listGeneratorService.makeFile({
      organizationDatabase: 'client-db',
      listId: 15,
      combinedColumns: '',
      selectedLocations: '',
      file: 'geojson',
      isGFWList: false,
    });

    // The first call is getListOfFields (before geometry is merged); page calls carry the merged filters
    const pageCalls = (analysisDataService.getDataPaginated as jest.Mock).mock.calls as Array<
      Array<{ geometry?: number }>
    >;
    const mergedFilters = pageCalls[1][0];
    expect(mergedFilters.geometry).toBe(1);
  });

  it('makeFile with csv file does not request geometry from the database', async () => {
    jest
      .spyOn(analysisDataService, 'getDataPaginated')
      .mockImplementation(() => Promise.resolve([{ attributes: '{"SomeAttr":"1"}' } as any]));

    await listGeneratorService.makeFile({
      organizationDatabase: 'client-db',
      listId: 15,
      combinedColumns: '',
      selectedLocations: '',
      file: 'csv',
      isGFWList: false,
    });

    const pageCalls = (analysisDataService.getDataPaginated as jest.Mock).mock.calls as Array<
      Array<{ geometry?: number }>
    >;
    const mergedFilters = pageCalls[1][0];
    expect(mergedFilters.geometry).toBe(0);
  });
});

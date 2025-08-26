import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { GreenHouseGasEmissionsGeneratorService } from './ghg.generator.service';
import { AnalysisGhgDataService } from '../data/analysis.ghg.data.service';
import { GreenHouseGasEmissionsService } from '../files/greenhouse.gas.emissions.service';
import { getAllFilesAndZip } from '../shared/file.utils';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';
import { GhgRawEmissions } from '../files/ghg.raw.emissions.service';
import { GhgIntermediateOutputs } from '../files/ghg.intermediate.outputs.service';

jest.mock('../shared/file.utils', () => ({
  getAllFilesAndZip: jest.fn(),
}));

describe('GreenHouseGasEmissionsGeneratorService', () => {
  let service: GreenHouseGasEmissionsGeneratorService;
  let mockAnalysisGhgDataService: jest.Mocked<AnalysisGhgDataService>;
  let mockGreenHouseGasEmissionsService: jest.Mocked<GreenHouseGasEmissionsService>;
  let mockGhgRawEmissionsService: jest.Mocked<GhgRawEmissions>;
  let mockGhgIntermediateOutputsService: jest.Mocked<GhgIntermediateOutputs>;

  beforeEach(async () => {
    mockAnalysisGhgDataService = {
      getNumberOfPages: jest.fn(),
      getDataPaginated: jest.fn(),
    } as unknown as jest.Mocked<AnalysisGhgDataService>;

    mockGreenHouseGasEmissionsService = {
      startEmail: jest.fn(),
      start: jest.fn(),
      process: jest.fn(),
      finish: jest.fn(),
      finishProcess: jest.fn(),
    } as unknown as jest.Mocked<GreenHouseGasEmissionsService>;

    mockGhgRawEmissionsService = {
      startEmail: jest.fn(),
      start: jest.fn(),
      process: jest.fn(),
      finish: jest.fn(),
      finishProcess: jest.fn(),
    } as unknown as jest.Mocked<GhgRawEmissions>;
    mockGhgIntermediateOutputsService = {
      startEmail: jest.fn(),
      start: jest.fn(),
      process: jest.fn(),
      finish: jest.fn(),
      finishProcess: jest.fn(),
    } as unknown as jest.Mocked<GhgIntermediateOutputs>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GreenHouseGasEmissionsGeneratorService,
        { provide: AnalysisGhgDataService, useValue: mockAnalysisGhgDataService },
        { provide: GreenHouseGasEmissionsService, useValue: mockGreenHouseGasEmissionsService },
        { provide: GhgRawEmissions, useValue: mockGhgRawEmissionsService },
        { provide: GhgIntermediateOutputs, useValue: mockGhgIntermediateOutputsService },
        { provide: Logger, useValue: new Logger() },
      ],
    }).compile();

    service = module.get<GreenHouseGasEmissionsGeneratorService>(
      GreenHouseGasEmissionsGeneratorService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call all necessary methods in makeFile', async () => {
    const mockFilters: BasicFieldsFileRequest = {
      organizationDatabase: 'example-database',
      userEmail: 'user@example.com',
      key: 'example-file.csv',
      file: 'shapefile',
      type: 'ghg',
      listId: 123,
    };

    mockAnalysisGhgDataService.getNumberOfPages.mockResolvedValue(2);
    mockAnalysisGhgDataService.getDataPaginated.mockResolvedValue([
      {
        country: '',
        coverageHA: 0,
        gadmId: '',
        jrcForestLossByYear: '',
        jrcLandAreaHA: 0,
        jrcLandDeforestedArea: 0,
        landmarkArea: 0,
        listId: 0,
        listName: '',
        analysisError: '',
        locationId: 0,
        naturalForestLossByYear: '',
        naturalForestLossHA: 0,
        negligibleRisk: 0,
        protectedAreasArea: 0,
        state: '',
        location_status_id: 0,
        errorDetails: '',
        subState: '',
        totalAreaHA: 0,
      },
    ]);

    await service.makeFile(mockFilters);

    expect(mockGreenHouseGasEmissionsService.startEmail).toHaveBeenCalledWith(mockFilters);
    expect(mockGreenHouseGasEmissionsService.start).toHaveBeenCalledWith(mockFilters);
    expect(mockAnalysisGhgDataService.getNumberOfPages).toHaveBeenCalledWith(mockFilters, 0);
    expect(mockAnalysisGhgDataService.getDataPaginated).toHaveBeenCalledTimes(2); // 2 pages
    expect(mockGreenHouseGasEmissionsService.process).toHaveBeenCalledTimes(2);
    expect(mockGreenHouseGasEmissionsService.finish).toHaveBeenCalledWith(mockFilters);
    expect(getAllFilesAndZip).toHaveBeenCalledWith(mockFilters);
    expect(mockGreenHouseGasEmissionsService.finishProcess).toHaveBeenCalledWith(mockFilters);
  });

  it('should log the number of pages during runGhgFileGeneration', async () => {
    const mockFilters: BasicFieldsFileRequest = {
      organizationDatabase: 'example-database',
      userEmail: 'user@example.com',
      key: 'example-file.csv',
      file: 'shapefile',
      type: 'ghg',
      listId: 123,
    };

    mockAnalysisGhgDataService.getNumberOfPages.mockResolvedValue(3);
    mockAnalysisGhgDataService.getDataPaginated.mockResolvedValue([
      {
        country: '',
        coverageHA: 0,
        gadmId: '',
        jrcForestLossByYear: '',
        jrcLandAreaHA: 0,
        jrcLandDeforestedArea: 0,
        landmarkArea: 0,
        listId: 0,
        listName: '',
        analysisError: '',
        locationId: 0,
        naturalForestLossByYear: '',
        naturalForestLossHA: 0,
        negligibleRisk: 0,
        protectedAreasArea: 0,
        state: '',
        location_status_id: 0,
        errorDetails: '',
        subState: '',
        totalAreaHA: 0,
      },
    ]);

    const loggerSpy = jest.spyOn(service['logger'], 'log');

    await service['runGhgFileGeneration'](mockFilters, 'location');

    expect(loggerSpy).toHaveBeenCalledWith('(123) - Number of pages: 3');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 0 from database');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 1 from database');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 2 from database');
  });
});

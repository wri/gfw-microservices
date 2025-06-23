import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AfiGeneratorService } from './afi.generator.service';
import { AnalysisAfiDataService } from '../data/analysis.afi.data.service';
import { NaturalForestLossService, OtherKpisService } from '../files';
import { getAllFilesAndZip } from '../shared/file.utils';
import { BasicFieldsFileRequest } from '@wri-monorepos/sql';

jest.mock('../shared/file.utils', () => ({
  getAllFilesAndZip: jest.fn(),
}));

describe('AfiGeneratorService', () => {
  let service: AfiGeneratorService;
  let mockAnalysisAfiDataService: jest.Mocked<AnalysisAfiDataService>;
  let mockNaturalForestLossService: jest.Mocked<NaturalForestLossService>;
  let mockOtherKpisService: jest.Mocked<OtherKpisService>;

  beforeEach(async () => {
    mockAnalysisAfiDataService = {
      getNumberOfPages: jest.fn(),
      getDataPaginated: jest.fn(),
    } as unknown as jest.Mocked<AnalysisAfiDataService>;

    mockNaturalForestLossService = {
      startEmail: jest.fn(),
      start: jest.fn(),
      process: jest.fn(),
      finish: jest.fn(),
      finishProcess: jest.fn(),
    } as unknown as jest.Mocked<NaturalForestLossService>;

    mockOtherKpisService = {
      start: jest.fn(),
      process: jest.fn(),
      finish: jest.fn(),
    } as unknown as jest.Mocked<OtherKpisService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AfiGeneratorService,
        { provide: AnalysisAfiDataService, useValue: mockAnalysisAfiDataService },
        { provide: NaturalForestLossService, useValue: mockNaturalForestLossService },
        { provide: OtherKpisService, useValue: mockOtherKpisService },
        { provide: Logger, useValue: new Logger() },
      ],
    }).compile();

    service = module.get<AfiGeneratorService>(AfiGeneratorService);
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
      type: 'afiVC',
      listId: 123,
    };

    mockAnalysisAfiDataService.getNumberOfPages.mockResolvedValue(2);
    mockAnalysisAfiDataService.getDataPaginated.mockResolvedValue([
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

    expect(mockNaturalForestLossService.startEmail).toHaveBeenCalledWith(mockFilters);
    expect(mockNaturalForestLossService.start).toHaveBeenCalledTimes(2); // For 'location' and 'list'
    expect(mockOtherKpisService.start).toHaveBeenCalledTimes(2);
    expect(mockAnalysisAfiDataService.getNumberOfPages).toHaveBeenCalledWith(mockFilters, 0);
    expect(mockAnalysisAfiDataService.getNumberOfPages).toHaveBeenCalledWith(mockFilters, 1);
    expect(mockAnalysisAfiDataService.getDataPaginated).toHaveBeenCalledTimes(4); // 2 pages * 2 suffixes
    expect(mockNaturalForestLossService.process).toHaveBeenCalledTimes(4);
    expect(mockOtherKpisService.process).toHaveBeenCalledTimes(4);
    expect(mockNaturalForestLossService.finish).toHaveBeenCalledTimes(2);
    expect(mockOtherKpisService.finish).toHaveBeenCalledTimes(2);
    expect(getAllFilesAndZip).toHaveBeenCalledWith(mockFilters);
    expect(mockNaturalForestLossService.finishProcess).toHaveBeenCalledWith(mockFilters);
  });

  it('should log the number of pages during runAfiFileGeneration', async () => {
    const mockFilters: BasicFieldsFileRequest = {
      organizationDatabase: 'example-database',
      userEmail: 'user@example.com',
      key: 'example-file.csv',
      file: 'shapefile',
      type: 'afiVC',
      listId: 123,
    };

    mockAnalysisAfiDataService.getNumberOfPages.mockResolvedValue(3);
    mockAnalysisAfiDataService.getDataPaginated.mockResolvedValue([
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

    await service['runAfiFileGeneration'](mockFilters, 'location');

    expect(loggerSpy).toHaveBeenCalledWith('(123) - Number of pages: 3');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 0 from database');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 1 from database');
    expect(loggerSpy).toHaveBeenCalledWith('(123) - Get page of number 2 from database');
  });
});

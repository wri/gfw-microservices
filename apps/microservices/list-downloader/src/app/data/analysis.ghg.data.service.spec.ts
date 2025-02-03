import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { AnalysisGhgDataService } from './analysis.ghg.data.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('[AnalysisGhgDataService] Get Data basic query param', () => {
  let service: AnalysisGhgDataService;

  const filters = {
    organizationDatabase: 'test',
    listId: 5692,
    rowsPerPage: 10,
    page: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env', '.env.production'],
          isGlobal: true,
        }),
      ],
      providers: [AnalysisGhgDataService],
    }).compile();

    service = module.get<AnalysisGhgDataService>(AnalysisGhgDataService);

    process.env.MSSQL_DATABASE = 'gfwpro';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get Number of pages', async () => {
    await service.getNumberOfPages(filters, 0);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3333/api/ghg/5692/number-of-pages?rowsPerPage=10&clientDatabase=test&isListLevel=0'
    );
  });

  it('Get Paginated Data', async () => {
    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ data: { paginatedData: [] } });
    const result = await service.getDataPaginated(filters, 0);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3333/api/ghg/5692/data-per-page?rowsPerPage=10&pageNumber=0&clientDatabase=test&isListLevel=0'
    );
    expect(result).toEqual({ paginatedData: [] });
  });
});

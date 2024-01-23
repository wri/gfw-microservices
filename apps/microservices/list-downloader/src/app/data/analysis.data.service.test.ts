import axios from 'axios';
import { AnalysisDataService } from './analysis.data.service';

// Mock jest and set the type
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('[AnalysisDataService] Get Data basic query param', () => {
  let service: AnalysisDataService;

  const filters = {
    organizationDatabase: 'test',
    listId: 5692,
    rowsPerPage: 10,
  };

  beforeEach(() => {
    service = new AnalysisDataService();
    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ data: { numberOfPages: 10 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get Number of pages', async () => {
    await service.getNumberOfPages(filters);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/pages-paginated-list-data?listId=5692&organizationDatabase=test&rowsPerPage=10'
    );
  });

  it('Get Paginated Data', async () => {
    await service.getDataPaginated({
      ...filters,
      page: 1,
    });

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/paginated-list-data?listId=5692&organizationDatabase=test&page=1&rowsPerPage=10'
    );
  });
});

describe('[AnalysisDataService] Get Data all query param', () => {
  let service: AnalysisDataService;

  const filters = {
    listId: 5692,
    organizationDatabase: 'test',
    analysisAreaMax: 10,
    analysisAreaMin: 1,
    country: 'Brazil',
    geometry: 0,
    orderType: 'ASC',
    page: 1,
    rowsPerPage: 200,
    sortByAttribute: 'analysisArea',
    state: 'Rio de Janeiro',
    subState: 'Rio de Janeiro',
    locationLogic: 'OR',
    locationIds: '1,2,3,4',
    locationStatement: 'test',
    combinedColumns: 'test1,test2',
    searchString: 'test',
  };

  beforeEach(() => {
    service = new AnalysisDataService();
    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ data: { numberOfPages: 10 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get Number of pages', async () => {
    await service.getNumberOfPages(filters);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/pages-paginated-list-data?listId=5692&organizationDatabase=test&analysisAreaMax=10&analysisAreaMin=1&country=Brazil&geometry=0&orderType=ASC&page=1&rowsPerPage=200&sortByAttribute=analysisArea&state=Rio%20de%20Janeiro&subState=Rio%20de%20Janeiro&locationLogic=OR&locationIds=1,2,3,4&locationStatement=test&combinedColumns=test1,test2&searchString=test'
    );
  });

  it('Get Paginated Data', async () => {
    await service.getDataPaginated(filters);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/paginated-list-data?listId=5692&organizationDatabase=test&analysisAreaMax=10&analysisAreaMin=1&country=Brazil&geometry=0&orderType=ASC&page=1&rowsPerPage=200&sortByAttribute=analysisArea&state=Rio%20de%20Janeiro&subState=Rio%20de%20Janeiro&locationLogic=OR&locationIds=1,2,3,4&locationStatement=test&combinedColumns=test1,test2&searchString=test'
    );
  });
});

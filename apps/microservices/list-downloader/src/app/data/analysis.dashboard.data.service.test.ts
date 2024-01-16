import axios from 'axios';
import { AnalysisDashboardDataService } from './analysis.dashboard.data.service';

// Mock jest and set the type
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('[AnalysisDashboardDataService] Get Data', () => {
  let service: AnalysisDashboardDataService;

  const filters = {
    organizationDatabase: 'test',
    listId: 5692,
    rowsPerPage: 10,
  };

  beforeEach(() => {
    service = new AnalysisDashboardDataService();
    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ count: 10 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get number of pages', () => {
    service.getNumberOfPages(filters);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/analysis/dashboard/5692?rowsPerPage=1&page=1&clientDatabase=test'
    );
  });

  it('Get paginated data', () => {
    service.getDataPaginated({
      ...filters,
      page: 2,
    });

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/analysis/dashboard/5692?rowsPerPage=10&page=2&clientDatabase=test'
    );
  });
});

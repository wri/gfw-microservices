import { AlertsDataService } from './alerts.data.service';

import axios from 'axios';

// Mock jest and set the type
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const filters = {
  organizationDatabase: 'test',
  listId: 6982,
  rowsPerPage: 100,
};

describe('[AlertsDataService] Get number of pages', () => {
  let service: AlertsDataService;

  beforeEach(() => {
    service = new AlertsDataService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('When count return 200', async () => {
    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ data: 200 });

    const value  = await service.getNumberOfPages(filters);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/alerts/6982/countDashboardData?clientDatabase=test'
    );

    expect(value).toBe(2);

  });

  it('When count return 0', async () => {
    service = new AlertsDataService();
    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ data: 0 });

    const value  = await service.getNumberOfPages(filters);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/alerts/6982/countDashboardData?clientDatabase=test'
    );

    expect(value).toBe(0);

  });
});

describe('[AnalysisAfiDataService] Get data', () => {
  let service: AlertsDataService;

  beforeEach(() => {
    service = new AlertsDataService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get number of pages for location level', () => {
    service.getDataPaginated({
      ...filters,
      numberOfPages: 2,
    });

    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ data: [] });

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/alerts/6982/dashboardDataPaginated?rowsPerPage=100&pageNumber=undefined&clientDatabase=test'
    );
  });
});

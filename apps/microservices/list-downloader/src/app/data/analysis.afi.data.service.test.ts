import { AnalysisAfiDataService } from './analysis.afi.data.service';

import axios from 'axios';

// Mock jest and set the type
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const filters = {
  organizationDatabase: 'test',
  listId: 6982,
  rowsPerPage: 100,
};

describe('[AnalysisAfiDataService] Get number of pages', () => {
  let service: AnalysisAfiDataService;

  beforeEach(() => {
    service = new AnalysisAfiDataService();
    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ data: { pages: 1 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get number of pages for location level', () => {
    service.getNumberOfPages(filters, 0);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/afi/6982/number-of-pages?rowsPerPage=100&clientDatabase=test&isListLevel=0'
    );
  });

  it('Get number of pages for list level data', () => {
    service.getNumberOfPages(filters, 1);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/afi/6982/number-of-pages?rowsPerPage=100&clientDatabase=test&isListLevel=1'
    );
  });
});

describe('[AnalysisAfiDataService] Get data', () => {
  let service: AnalysisAfiDataService;

  beforeEach(() => {
    service = new AnalysisAfiDataService();
    jest.spyOn(mockedAxios, 'get').mockResolvedValueOnce({ data: { pages: 1 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Get number of pages for location level', () => {
    service.getDataPaginated(filters, 0);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/afi/6982/data-per-page?rowsPerPage=100&pageNumber=undefined&clientDatabase=test&isListLevel=0'
    );
  });

  it('Get number of pages for list level data', () => {
    service.getDataPaginated(filters, 1);

    expect(mockedAxios.get).toBeCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3334/api/afi/6982/data-per-page?rowsPerPage=100&pageNumber=undefined&clientDatabase=test&isListLevel=1'
    );
  });
});

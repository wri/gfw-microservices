import axios from 'axios';
import { deleteAllFilteredLocations } from './deleteAllFilteredLocations';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('deleteAllFilteredLocations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make axios request with basic parameters', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 123;
    const filters = {};
    const listFilterStr = 'test search';

    const result = await deleteAllFilteredLocations(listID, filters, listFilterStr);

    expect(mockedAxios).toHaveBeenCalledWith({
      url: '/locations/deleteAllFilteredLocations',
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      params: {
        listID: 123,
        searchString: 'test search',
      },
    });

    expect(result).toEqual({ success: true });
  });

  it('should include country filter when selectedCountry is provided', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 123;
    const filters = { selectedCountry: 'USA' };
    const listFilterStr = '';

    await deleteAllFilteredLocations(listID, filters, listFilterStr);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          country: 'USA',
        }),
      })
    );
  });

  it('should include state filter when selectedState is provided', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 123;
    const filters = { selectedState: 'California' };
    const listFilterStr = '';

    await deleteAllFilteredLocations(listID, filters, listFilterStr);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          state: 'California',
        }),
      })
    );
  });

  it('should include subState filter when selectedSubState is provided', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 123;
    const filters = { selectedSubState: 'Los Angeles' };
    const listFilterStr = '';

    await deleteAllFilteredLocations(listID, filters, listFilterStr);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          subState: 'Los Angeles',
        }),
      })
    );
  });

  it('should include area filters when selectedAreaMin and selectedAreaMax are provided', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 123;
    const filters = {
      selectedAreaMin: 100,
      selectedAreaMax: 500,
    };
    const listFilterStr = '';

    await deleteAllFilteredLocations(listID, filters, listFilterStr);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          selectedAreaMin: 100,
          selectedAreaMax: 500,
        }),
      })
    );
  });

  it('should include all filters when all are provided', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 456;
    const filters = {
      selectedCountry: 'Brazil',
      selectedState: 'São Paulo',
      selectedSubState: 'Santos',
      selectedAreaMin: 50,
      selectedAreaMax: 1000,
    };
    const listFilterStr = 'forest area';

    await deleteAllFilteredLocations(listID, filters, listFilterStr);

    expect(mockedAxios).toHaveBeenCalledWith({
      url: '/locations/deleteAllFilteredLocations',
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      params: {
        listID: 456,
        searchString: 'forest area',
        country: 'Brazil',
        state: 'São Paulo',
        subState: 'Santos',
        selectedAreaMin: 50,
        selectedAreaMax: 1000,
      },
    });
  });

  it('should not include filters when they are falsy', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 789;
    const filters = {
      selectedCountry: '',
      selectedState: null,
      selectedSubState: undefined,
      selectedAreaMin: 0,
      selectedAreaMax: false,
    };
    const listFilterStr = '';

    await deleteAllFilteredLocations(listID, filters, listFilterStr);

    expect(mockedAxios).toHaveBeenCalledWith({
      url: '/locations/deleteAllFilteredLocations',
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
      params: {
        listID: 789,
        searchString: '',
      },
    });
  });

  it('should log the correct information', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 123;
    const filters = { selectedCountry: 'USA' };
    const listFilterStr = 'test';

    await deleteAllFilteredLocations(listID, filters, listFilterStr);
  });
});

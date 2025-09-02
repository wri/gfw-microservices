import axios from 'axios';
import { getListFilterValues } from './getListFilterValues';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('getListFilterValues', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make GET request to correct endpoint', async () => {
    const mockResponse = { data: { filters: ['country', 'state'] } };
    mockedAxios.mockResolvedValue(mockResponse);

    const listID = 123;
    const result = await getListFilterValues(listID);

    expect(mockedAxios).toHaveBeenCalledWith({
      url: '/locations/filters/123',
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    });

    expect(result).toEqual({ filters: ['country', 'state'] });
  });

  it('should handle different listID values', async () => {
    const mockResponse = { data: { success: true } };
    mockedAxios.mockResolvedValue(mockResponse);

    await getListFilterValues(456);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/locations/filters/456',
      })
    );
  });

  it('should handle axios errors', async () => {
    const mockError = new Error('Network error');
    mockedAxios.mockRejectedValue(mockError);

    await expect(getListFilterValues(123)).rejects.toThrow('Network error');
  });

  it('should return response data', async () => {
    const mockData = {
      countries: ['USA', 'Brazil'],
      states: ['California', 'Texas'],
    };
    const mockResponse = { data: mockData };
    mockedAxios.mockResolvedValue(mockResponse);

    const result = await getListFilterValues(789);

    expect(result).toEqual(mockData);
  });
});

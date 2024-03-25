/**
 * @jest-environment node
 */
const makeListProcessingRequest = require('./makeListProcessingRequest');
const fetch = require('node-fetch');

jest.mock('node-fetch', () => jest.fn());

describe('makeListProcessingRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.LISTS_MICROSERVICE_URL = 'http://localhost:3333/api';
  });

  it('should successfully make a list processing request', async () => {
    const mockResponse = Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: 'some data' }),
    });

    fetch.mockImplementation(() => mockResponse);

    const response = await makeListProcessingRequest({
      clientDatabase: 'testDb',
      listId: '123',
      category: 'WDPA',
      country: 'testCountry',
      countryGadm: 'testGadm',
      locationId: 'testLocationId',
    });

    expect(response).toEqual({
      error: false,
      category: 'WDPA',
      data: { data: 'some data' },
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle request failure gracefully', async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })
    );

    await expect(
      makeListProcessingRequest({
        clientDatabase: 'testDb',
        listId: '123',
        category: 'WDPA',
        country: 'testCountry',
        countryGadm: 'testGadm',
        locationId: 'testLocationId',
      })
    ).rejects.toThrow(
      "ListProcessingRequestError Error POST http://localhost:3333/api/fcd/v2/123/WDPA failed with status 404: 'Not Found'"
    );

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

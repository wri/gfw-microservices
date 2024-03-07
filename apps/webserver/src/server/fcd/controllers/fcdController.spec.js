const exp = require('constants');
const axios = require('axios');
const { getData } = require('./fcdController');

describe('FCD Controller', () => {
  test('should return 400 when all input parameters is empty', async () => {
    const [status, response] = await getData({});
    expect(status).toBe(400);
    expect(response.error).toBe(true);
    expect(response.message.length).toBe(3);
    expect(response.message).toStrictEqual([
      'Missing listId',
      'Missing category',
      'Missing country',
    ]);
  });

  test('should return 400 when list Id is missing', async () => {
    const [status, response] = await getData({
      category: 'wdpa',
      country: 'Argentina',
    });
    expect(status).toBe(400);
    expect(response.error).toBe(true);
    expect(response.message.length).toBe(1);
    expect(response.message).toStrictEqual(['Missing listId']);
  });

  test('should return 400 when country is missing', async () => {
    const [status, response] = await getData({
      category: 'wdpa',
      listId: 5692,
    });
    expect(status).toBe(400);
    expect(response.error).toBe(true);
    expect(response.message.length).toBe(1);
    expect(response.message).toStrictEqual(['Missing country']);
  });

  test('should return 400 when category is missing', async () => {
    const [status, response] = await getData({
      listId: 5692,
      country: 'Argentina',
    });
    expect(status).toBe(400);
    expect(response.error).toBe(true);
    expect(response.message.length).toBe(1);
    expect(response.message).toStrictEqual(['Missing category']);
  });

  test('should return 400 when catergory is not wdpa or landmark', async () => {
    const [status, response] = await getData({
      listId: 5692,
      category: 'test',
      country: 'Argentina',
    });
    expect(status).toBe(400);
    expect(response.error).toBe(true);
    expect(response.message.length).toBe(1);
    expect(response.message).toStrictEqual(['Missing category']);
  });

  test('should return 200 with wdpa data', async () => {
    jest.spyOn(axios, 'get').mockImplementation(() =>
      Promise.resolve({
        data: {
          overlap: {
            fullyRestrictive: 123,
            lessRestricted: 45,
          },
        },
      })
    );

    const [status, response] = await getData({
      listId: 5692,
      category: 'wdpa',
      country: 'Argentina',
      organizationDatabase: 'Test-CO',
    });

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:3333/api/fcd/5692/wdpa_overlap_country/Argentina?clientDatabase=Test-CO'
    );
    expect(status).toBe(200);
    expect(response.error).toBe(false);
    expect(response).toStrictEqual({
      error: false,
      wdpa: {
        overlap: {
          fullyRestrictive: 123,
          lessRestricted: 45,
        },
      },
    });
  });

  test('should return 200 with landmark', async () => {
    jest.spyOn(axios, 'get').mockImplementation(() =>
      Promise.resolve({
        data: {
          overlap: {
            indigenous: 1222,
            nonIndigenous: 3802,
          },
        },
      })
    );

    const [status, response] = await getData({
      listId: 5692,
      category: 'landmark',
      country: 'Argentina',
      organizationDatabase: 'Test-CO',
    });

    expect(axios.get).toHaveBeenCalledWith(
      'http://localhost:3333/api/fcd/5692/landmark_overlap_country/Argentina?clientDatabase=Test-CO'
    );
    expect(status).toBe(200);
    expect(response.error).toBe(false);
    expect(response).toStrictEqual({
      error: false,
      landmark: {
        overlap: {
          indigenous: 1222,
          nonIndigenous: 3802,
        },
      },
    });
  });
});

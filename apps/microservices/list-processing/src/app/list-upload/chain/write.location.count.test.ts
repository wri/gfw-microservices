import { WriteLocationCount } from './write.location.count';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { ChainType, RequestNewList } from './types';

// Mock the dependencies
jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn().mockResolvedValue({
      getRepository: jest.fn().mockReturnValue({
        update: jest.fn(), // Ensure this is a Jest mock function
      }),
      close: jest.fn().mockResolvedValue({}),
    }),
  })),
  Lists: jest.fn(),
}));
describe('WriteLocationCount', () => {
  let writeLocationCount: WriteLocationCount;
  let clientStoreConnection: ClientStoreConnection;

  beforeEach(() => {
    clientStoreConnection = new ClientStoreConnection();
    writeLocationCount = new WriteLocationCount(clientStoreConnection);
  });

  it('should update the list location count and log the result', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        list_id: 1,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection', // Add this line
        features: [
          {
            type: 'Feature',
            properties: { gadmid: 1 },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            properties: { gadmid: 2 },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      },
    };

    await writeLocationCount.handle(request);

    const connection = await clientStoreConnection.getConnection('test_db');
    const listRepository = connection.getRepository(Lists);

    expect(listRepository.update).toHaveBeenCalledWith({ id: 1 }, { listLocationsCount: 2 });
  });

  it('should log an error if updating the list fails', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        list_id: 1,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      },
    };

    const connection = await clientStoreConnection.getConnection('test_db');
    const listRepository = connection.getRepository(Lists);
    (listRepository.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

    await expect(writeLocationCount.handle(request)).rejects.toThrow('Update failed');
  });
});

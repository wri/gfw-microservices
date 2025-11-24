import { WriteLocationCount } from './write.location.count';
import { ClientStoreConnection, Lists } from '@wri-monorepos/sql';
import { ChainType, RequestNewList } from './types';
import { DataSource, Repository } from 'typeorm';

// Mock the dependencies
jest.mock('@nestjs/common', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
  })),
  HttpStatus: [],
}));

type MockRepository = {
  [K in keyof Repository<Lists>]: jest.Mock;
};

const mockRepository: MockRepository = {
  update: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  metadata: undefined,
  manager: undefined,
  createQueryBuilder: jest.fn(),
  hasId: jest.fn(),
  getId: jest.fn(),
  clear: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
  findAndCount: jest.fn(),
  findBy: jest.fn(),
  findOneBy: jest.fn(),
  findOneById: jest.fn(),
  findOneOrFail: jest.fn(),
  findOneByOrFail: jest.fn(),
  query: jest.fn(),
  target: undefined,
  remove: jest.fn(),
  insert: jest.fn(),
  upsert: jest.fn(),
  softDelete: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  restore: jest.fn(),
  countBy: jest.fn(),
  exist: jest.fn(),
  preload: jest.fn(),
  merge: jest.fn(),
  extend: jest.fn(),
} as unknown as MockRepository;

const mockConnection = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
  close: jest.fn().mockResolvedValue({}),
} as unknown as DataSource;

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn().mockResolvedValue(mockConnection),
  })),
  Lists: jest.fn(),
}));

describe('WriteLocationCount', () => {
  let writeLocationCount: WriteLocationCount;
  let clientStoreConnection: ClientStoreConnection;
  let mockListRepository: MockRepository;

  beforeEach(async () => {
    clientStoreConnection = new ClientStoreConnection();
    writeLocationCount = new WriteLocationCount(clientStoreConnection);

    // Get the mock repository for each test
    const connection = await clientStoreConnection.getConnection('test_db');
    mockListRepository = connection.getRepository(Lists) as unknown as MockRepository;

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should update the list location count for new locations', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        list_id: 1,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
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

    mockListRepository.findOne.mockResolvedValue({ listLocationsCount: 3 });

    await writeLocationCount.handle(request);

    expect(mockListRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockListRepository.update).toHaveBeenCalledWith({ id: 1 }, { listLocationsCount: 5 });
  });

  it('should handle list with no existing locations', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        list_id: 1,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { gadmid: 1 },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      },
    };

    mockListRepository.findOne.mockResolvedValue({ listLocationsCount: null });

    await writeLocationCount.handle(request);

    expect(mockListRepository.update).toHaveBeenCalledWith({ id: 1 }, { listLocationsCount: 1 });
  });

  it('should handle features with errors or missing gadmid', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        list_id: 1,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { gadmid: 1 },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            properties: { error: 'Invalid location' },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      },
    };

    mockListRepository.findOne.mockResolvedValue({ listLocationsCount: 0 });

    await writeLocationCount.handle(request);

    expect(mockListRepository.update).toHaveBeenCalledWith({ id: 1 }, { listLocationsCount: 1 });
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

    mockListRepository.findOne.mockResolvedValue({ listLocationsCount: 0 });
    mockListRepository.update.mockRejectedValue(new Error('Update failed'));

    await expect(writeLocationCount.handle(request)).rejects.toThrow('Update failed');
  });

  it('should handle findOne failure', async () => {
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

    mockListRepository.findOne.mockRejectedValue(new Error('Find failed'));

    await expect(writeLocationCount.handle(request)).rejects.toThrow('Find failed');
  });
});

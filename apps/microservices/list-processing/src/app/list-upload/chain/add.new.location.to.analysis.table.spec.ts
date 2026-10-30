import { AddNewLocationToAnalysisTable } from './add.new.location.to.analysis.table';
import { ClientStoreConnection } from '@wri-monorepos/sql';
import { ChainType, RequestNewList } from './types';
import { DataSource } from 'typeorm';
import { Feature, FeatureCollection, Geometry } from '@wri-monorepos/geo';

jest.mock('@wri-monorepos/sql');

describe('AddNewLocationToAnalysisTable', () => {
  let handler: AddNewLocationToAnalysisTable;
  let mockConnection: jest.Mocked<DataSource>;
  let mockClientStoreConnection: jest.Mocked<ClientStoreConnection>;

  beforeEach(() => {
    mockClientStoreConnection = new ClientStoreConnection() as jest.Mocked<ClientStoreConnection>;
    mockConnection = {
      createQueryBuilder: jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn(),
      }),
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn(),
      query: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    mockClientStoreConnection.getConnection = jest.fn().mockResolvedValue(mockConnection);
    mockClientStoreConnection.refreshConnection = jest.fn().mockResolvedValue(true);
    mockClientStoreConnection.invalidateConnection = jest.fn().mockResolvedValue(undefined);
    handler = new AddNewLocationToAnalysisTable(mockClientStoreConnection);
  });

  it('should insert locations from the request into the analysis table', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        analysisTable: 'test_analysis',
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] } as Geometry,
            properties: { locationId: 1 },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] } as Geometry,
            properties: { locationId: 2 },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] } as Geometry,
            properties: { locationId: 3 },
          },
        ],
      } as FeatureCollection,
    };

    await handler.handle(request);

    expect(mockClientStoreConnection.getConnection).toHaveBeenCalledWith(
      'test_db',
      expect.any(Array)
    );
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO [test_analysis] (location_id, location_status_id)')
    );
    expect(mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining('(1, 1), (2, 1), (3, 1)')
    );
  });

  it('should process locations in batches when exceeding batch size', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        analysisTable: 'test_analysis',
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: Array.from({ length: 1500 }, (_, i) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] } as Geometry,
          properties: { locationId: i + 1 },
        })) as Feature[],
      } as FeatureCollection,
    };

    await handler.handle(request);

    // Should be called twice - once for 1000 records and once for 500 records
    expect(mockConnection.query).toHaveBeenCalledTimes(2);
    // The cached connection must be kept alive once per batch so the 30s
    // dynamic-connection TTL cannot expire mid-loop.
    expect(mockClientStoreConnection.refreshConnection).toHaveBeenCalledTimes(2);
  });

  it('should handle empty geojson features array', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        analysisTable: 'test_analysis',
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [],
      } as FeatureCollection,
    };

    await handler.handle(request);

    expect(mockConnection.query).not.toHaveBeenCalled();
  });

  it('should throw error when database connection fails', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        analysisTable: 'test_analysis',
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] } as Geometry,
            properties: { locationId: 1 },
          },
        ],
      } as FeatureCollection,
    };

    mockClientStoreConnection.getConnection.mockRejectedValueOnce(new Error('Connection failed'));

    await expect(handler.handle(request)).rejects.toThrow('Connection failed');
  });

  it('should throw error when database query fails', async () => {
    const request: ChainType = {
      request: {
        organization_database: 'test_db',
        analysisTable: 'test_analysis',
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] } as Geometry,
            properties: { locationId: 1 },
          },
        ],
      } as FeatureCollection,
    };

    mockConnection.query.mockRejectedValueOnce(new Error('Query failed'));

    await expect(handler.handle(request)).rejects.toThrow('Query failed');
  });
});

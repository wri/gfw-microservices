import { InsertLocationData } from './insert.location.data';
import { ClientStoreConnection, ListSchema, ListSchemaType } from '@wri-monorepos/sql';
import { FeatureCollection } from '@wri-monorepos/geo';
import { EntitySchema, DataSource } from 'typeorm';
import { ChainType, RequestNewList } from './types';

const locationsDataMock = [
  {
    locationName: 'Location 1',
    latitude: 0,
    longitude: 0,
    analysisRadius: '100',
    analysisArea: 'Area 1',
    commodity: 'Commodity 1',
    attributes: '{}',
    locationClassification: 'Location Classification 1',
  },
  {
    locationName: 'Location 2',
    latitude: 1,
    longitude: 1,
    analysisRadius: '100',
    analysisArea: 'Area 1',
    commodity: 'Commodity 1',
    attributes: '{}',
    locationClassification: 'Location Classification 1',
  },
];

describe('InsertLocationData', () => {
  let insertLocationData: InsertLocationData;
  let clientStoreConnection: ClientStoreConnection;
  let dataSource: DataSource;

  const ListEntity = new EntitySchema<ListSchemaType>({
    ...ListSchema,
    name: 'list_test_table',
  });

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [ListEntity],
      synchronize: true,
      logging: false,
    });

    clientStoreConnection = new ClientStoreConnection();

    // Mock the getConnection method to return the DataSource instance
    jest.spyOn(clientStoreConnection, 'getConnection').mockResolvedValue(dataSource);

    // Initialize the DataSource
    await dataSource.initialize();

    insertLocationData = new InsertLocationData(clientStoreConnection);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should insert data into the database', async () => {
    const input: ChainType = {
      request: {
        organization_database: 'test-org-db',
        listTable: 'list_test_table',
        list_name: 'test-list',
        path: 'test-path',
        user_id: 1,
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        hasUnanalyzableError: false,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: locationsDataMock[0],
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            properties: locationsDataMock[1],
            geometry: { type: 'Point', coordinates: [1, 1] },
          },
        ],
      } as FeatureCollection,
    };

    await insertLocationData.handle(input);

    const insertedData = await dataSource.getRepository(ListEntity).find();

    expect(insertedData).toHaveLength(2);
    expect(insertedData[0].locationName).toBe('Location 1');
    expect(insertedData[1].locationName).toBe('Location 2');
  });

  it('should throw an error if insertion fails', async () => {
    const input: ChainType = {
      request: {
        organization_database: 'test_db',
        listTable: 'list_test_table',
        list_name: 'test_table',
        path: 'path',
        user_id: 1,
        isExternalAPIProcess: false,
        organization_id: 1,
        subscription_status_id: 1,
        hasUnanalyzableError: false,
      } as RequestNewList,
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              locationName: 'Location 1',
              latitude: 0,
              longitude: 0,
              analysisRadius: '100',
              analysisArea: 'Area 1',
              commodity: 'Commodity 1',
              attributes: '{}',
              locationClassification: 'Location Classification 1',
            },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      } as FeatureCollection,
    };

    jest
      .spyOn(clientStoreConnection, 'getConnection')
      .mockRejectedValue(new Error('Connection failed'));

    await expect(insertLocationData.handle(input)).rejects.toThrow('Connection failed');
  });
});

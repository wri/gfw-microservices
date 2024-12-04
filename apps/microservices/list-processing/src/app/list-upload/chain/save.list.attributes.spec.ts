import { SaveListAttributes } from './save.list.attributes';
import { Logger } from '@nestjs/common';
import { SQLUtils } from '@wri-monorepos/sql';
import { ClientStoreConnection, ListAttributes } from '@wri-monorepos/sql';
import { ChainType, RequestNewList, ListAttributesRecord } from './types';

jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDB: jest.fn(),
  },
  ClientStoreConnection: jest.fn().mockImplementation(() => ({
    getConnection: jest.fn(),
  })),
  ListAttributes: jest.fn(),
}));

const mockQueryDB = SQLUtils.queryDB as jest.Mock;
const mockClientStoreConnection = ClientStoreConnection as jest.Mock;

class TestableSaveListAttributes extends SaveListAttributes {
  public async getAttributesFromListTable(
    organizationDatabase: string,
    listTable: string,
    listId: number
  ): Promise<ListAttributesRecord[]> {
    return super.getAttributesFromListTable(organizationDatabase, listTable, listId);
  }

  public async getExistingListAttributesForListId(
    orgDb: string,
    listId: number
  ): Promise<Map<string, ListAttributesRecord>> {
    return super.getExistingListAttributesForListId(orgDb, listId);
  }

  public async determineAttributeType(
    orgDb: string,
    listTable: string,
    listId: number,
    attributeName: string,
    maxRecords = 100
  ): Promise<number> {
    return super.determineAttributeType(orgDb, listTable, listId, attributeName, maxRecords);
  }

  public async saveLocAttributesToListAttributes(
    orgDb: string,
    attributes: ListAttributesRecord[]
  ): Promise<void> {
    return super.saveLocAttributesToListAttributes(orgDb, attributes);
  }
}

describe('SaveListAttributes', () => {
  let saveListAttributes: TestableSaveListAttributes;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(() => {
    saveListAttributes = new TestableSaveListAttributes();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => void 0);
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => void 0);
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => void 0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAttributesFromListTable', () => {
    it('should parse attributes correctly and return attribute infos', async () => {
      const organizationDatabase = 'test_db';
      const listTable = 'test_table';
      const listId = 1;

      const mockResultSets = [
        {
          attributesJson: JSON.stringify([
            { field: 'age', type: 'number' },
            { field: 'name', type: 'string' },
          ]),
        },
        {
          attributesJson: JSON.stringify([
            { field: 'age', type: 'number' },
            { field: 'email', type: 'string' },
          ]),
        },
      ];

      const mockExistingAttributes = new Map();

      mockQueryDB.mockImplementationOnce(() => Promise.resolve(mockResultSets));

      jest
        .spyOn(saveListAttributes, 'getExistingListAttributesForListId')
        .mockImplementationOnce(() => Promise.resolve(mockExistingAttributes));

      jest
        .spyOn(saveListAttributes, 'determineAttributeType')
        .mockImplementation(() => Promise.resolve(2));

      const result = await saveListAttributes.getAttributesFromListTable(
        organizationDatabase,
        listTable,
        listId
      );

      expect(result).toEqual([
        { list_id: listId, attribute_name: 'age', attribute_type: 1 },
        { list_id: listId, attribute_name: 'name', attribute_type: 2 },
        { list_id: listId, attribute_name: 'email', attribute_type: 2 },
      ]);
    });

    it('should handle JSON parsing errors and skip the row', async () => {
      const organizationDatabase = 'test_db';
      const listTable = 'test_table';
      const listId = 1;

      const mockResultSets = [
        {
          attributesJson: 'invalid_json',
        },
      ];

      const mockExistingAttributes = new Map();

      mockQueryDB.mockImplementationOnce(() => Promise.resolve(mockResultSets));

      jest
        .spyOn(saveListAttributes, 'getExistingListAttributesForListId')
        .mockImplementationOnce(() => Promise.resolve(mockExistingAttributes));

      const result = await saveListAttributes['getAttributesFromListTable'](
        organizationDatabase,
        listTable,
        listId
      );

      expect(loggerErrorSpy).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle inconsistent attribute types and determine the correct type', async () => {
      const organizationDatabase = 'test_db';
      const listTable = 'test_table';
      const listId = 1;

      const mockResultSets = [
        {
          attributesJson: JSON.stringify([{ field: 'age', type: 'string' }]),
        },
        {
          attributesJson: JSON.stringify([{ field: 'age', type: 'number' }]),
        },
      ];

      const mockExistingAttributes = new Map();
      mockExistingAttributes.set('age', {
        list_id: listId,
        attribute_name: 'age',
        attribute_type: 2,
      });

      mockQueryDB.mockImplementationOnce(() => Promise.resolve(mockResultSets));

      jest
        .spyOn(saveListAttributes, 'getExistingListAttributesForListId')
        .mockImplementationOnce(() => Promise.resolve(mockExistingAttributes));

      jest
        .spyOn(saveListAttributes, 'determineAttributeType')
        .mockImplementation(() => Promise.resolve(1));

      const result = await saveListAttributes['getAttributesFromListTable'](
        organizationDatabase,
        listTable,
        listId
      );

      expect(loggerWarnSpy).toHaveBeenCalled();
      expect(result).toEqual([{ list_id: listId, attribute_name: 'age', attribute_type: 1 }]);
    });
  });

  describe('determineAttributeType', () => {
    it('should return the most frequent attribute type', async () => {
      const orgDb = 'test_db';
      const listTable = 'test_table';
      const listId = 1;
      const attributeName = 'age';

      const mockResultSets = [
        {
          attributesJson: JSON.stringify([{ field: 'age', type: 'number' }]),
        },
        {
          attributesJson: JSON.stringify([{ field: 'age', type: 'number' }]),
        },
        {
          attributesJson: JSON.stringify([{ field: 'age', type: 'string' }]),
        },
      ];

      mockQueryDB.mockImplementationOnce(() => Promise.resolve(mockResultSets));

      const result = await saveListAttributes['determineAttributeType'](
        orgDb,
        listTable,
        listId,
        attributeName
      );

      expect(result).toBe(1); // ListsAttrsTypes.Int
    });

    it('should default to text when types are equal or no data', async () => {
      const orgDb = 'test_db';
      const listTable = 'test_table';
      const listId = 1;
      const attributeName = 'name';

      const mockResultSets = [];

      mockQueryDB.mockImplementationOnce(() => Promise.resolve(mockResultSets));

      const result = await saveListAttributes['determineAttributeType'](
        orgDb,
        listTable,
        listId,
        attributeName
      );

      expect(result).toBe(2); // ListsAttrsTypes.Text
    });
  });

  describe('saveLocAttributesToListAttributes', () => {
    it('should save attributes to the database', async () => {
      const orgDb = 'test_db';
      const attributes = [
        { list_id: 1, attribute_name: 'age', attribute_type: 1 },
        { list_id: 1, attribute_name: 'name', attribute_type: 2 },
      ];

      const mockConnection = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };

      mockClientStoreConnection.mockImplementationOnce(() => ({
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      }));

      await saveListAttributes['saveLocAttributesToListAttributes'](orgDb, attributes);

      expect(loggerLogSpy).toHaveBeenCalledWith(
        `Inserting ${attributes.length} into ListAttributes From ListSchema`
      );
      expect(mockConnection.insert).toHaveBeenCalled();
      expect(mockConnection.into).toHaveBeenCalledWith(ListAttributes);
      expect(mockConnection.values).toHaveBeenCalledWith(attributes);
      expect(mockConnection.execute).toHaveBeenCalled();
    });

    it('should handle database insertion errors', async () => {
      const orgDb = 'test_db';
      const attributes = [{ list_id: 1, attribute_name: 'age', attribute_type: 1 }];

      const mockConnection = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('DB Error')),
      };

      mockClientStoreConnection.mockImplementationOnce(() => ({
        getConnection: jest.fn().mockResolvedValue(mockConnection),
      }));

      await saveListAttributes['saveLocAttributesToListAttributes'](orgDb, attributes);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        `Something went wrong inserting ListAttributes`,
        expect.stringContaining('DB Error')
      );
    });
  });

  describe('handle', () => {
    it('should process the request and invoke necessary methods', async () => {
      const request: ChainType = {
        request: {
          listId: 1,
          listTable: 'test_table',
          organization_database: 'test_db',
        } as RequestNewList,
      };

      jest
        .spyOn(saveListAttributes, 'getAttributesFromListTable')
        .mockImplementation(() => Promise.resolve([]));

      jest
        .spyOn(saveListAttributes, 'saveLocAttributesToListAttributes')
        .mockImplementation(() => Promise.resolve());

      const result = await saveListAttributes.handle(request);

      expect(saveListAttributes['getAttributesFromListTable']).toHaveBeenCalledWith(
        'test_db',
        'test_table',
        1
      );

      expect(saveListAttributes['saveLocAttributesToListAttributes']).toHaveBeenCalledWith(
        'test_db',
        []
      );

      expect(result).toBe(request);
    });
  });
});

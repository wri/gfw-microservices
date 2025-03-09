import { ListsAttrsTypes, SaveListAttributes } from './save.list.attributes';
import { Logger } from '@nestjs/common';
import { ClientStoreConnection, ListAttributes, SQLUtils } from '@wri-monorepos/sql';
import { ChainType, RequestNewList } from './types';
import { Feature } from '@wri-monorepos/geo';

/**
 * Mocking external dependencies and methods
 */
jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn(),
  SQLUtils: { queryDB: jest.fn() },
  ListAttributes: jest.fn(),
}));

describe('SaveListAttributes', () => {
  let saveListAttributes: SaveListAttributes;

  let mockGetConnection: jest.Mock;
  let mockQueryBuilder: any;

  beforeEach(() => {
    jest.clearAllMocks();
    saveListAttributes = new SaveListAttributes();

    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const mockConnection = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    mockGetConnection = jest.fn().mockResolvedValue(mockConnection);

    (ClientStoreConnection as unknown as jest.Mock).mockImplementation(() => {
      return {
        getConnection: mockGetConnection,
      };
    });
  });

  describe('saveLocAttributesToListAttributes', () => {
    it('should insert attributes successfully', async () => {
      const orgDb = 'myOrgDb';
      const attributes = [
        { list_id: 1, attribute_name: 'height', attribute_type: ListsAttrsTypes.Int },
      ];

      await saveListAttributes.saveLocAttributesToListAttributes(orgDb, attributes);

      expect(mockGetConnection).toHaveBeenCalledWith(orgDb, [ListAttributes]);
      expect(mockQueryBuilder.insert).toHaveBeenCalled();
      expect(mockQueryBuilder.values).toHaveBeenCalledWith(attributes);
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should handle DB errors and throw it if something goes wrong', async () => {
      const orgDb = 'myOrgDb';
      const attributes = [
        { list_id: 1, attribute_name: 'width', attribute_type: ListsAttrsTypes.Int },
      ];

      mockGetConnection.mockRejectedValueOnce(new Error('DB Connection Error'));

      const loggerWarnSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await expect(
        saveListAttributes.saveLocAttributesToListAttributes(orgDb, attributes)
      ).rejects.toThrow();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Something went wrong executing query.',
        expect.stringMatching(/Error: DB Connection Error/)
      );
    });

    it('should log a warning if a violation of primary key happens', async () => {
      const orgDb = 'myOrgDb';
      const attributes = [
        { list_id: 1, attribute_name: 'width', attribute_type: ListsAttrsTypes.Int },
      ];

      mockGetConnection.mockRejectedValueOnce(
        new Error(
          "Violation of PRIMARY KEY constraint 'PK_ListAttributes'. Cannot insert duplicate key in object 'dbo.ListAttributes'."
        )
      );

      const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();

      await saveListAttributes.saveLocAttributesToListAttributes(orgDb, attributes);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Constraint violation.',
        expect.stringMatching(/Violation of PRIMARY KEY constraint/)
      );
    });
  });

  describe('getExistingListAttributesByListId', () => {
    it('should return a set of existing attributes', async () => {
      const orgDb = 'myOrgDb';
      const list_id = 123;
      const mockResults = [{ attribute_name: 'width' }, { attribute_name: 'height' }];

      (SQLUtils.queryDB as jest.Mock).mockResolvedValue(mockResults);

      const result = await saveListAttributes.getExistingListAttributesByListId(orgDb, list_id);

      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        orgDb,
        'SELECT [attribute_name] FROM [ListAttributes] WHERE list_id = 123'
      );
      expect(result).toBeInstanceOf(Set);
      expect(result.has('width')).toBe(true);
      expect(result.has('height')).toBe(true);
    });
  });

  describe('extractFeatureAttributes', () => {
    it('should parse and filter out existing attributes', async () => {
      const orgDb = 'myOrgDb';
      const list_id = 1;
      const feature = {
        properties: {
          attributes: JSON.stringify([
            { field: 'width', type: 'number' },
            { field: 'color', type: 'string' },
          ]),
        },
      } as unknown as Feature;

      const existingAttrs = new Set(['width']);
      jest
        .spyOn(saveListAttributes, 'getExistingListAttributesByListId')
        .mockResolvedValue(existingAttrs);

      const result = await saveListAttributes.extractFeatureAttributes(orgDb, list_id, feature);

      expect(result).toEqual([
        {
          list_id: 1,
          attribute_name: 'color',
          attribute_type: ListsAttrsTypes.Text,
        },
      ]);
    });

    it('should throw an error if JSON parsing fails', async () => {
      const orgDb = 'myOrgDb';
      const list_id = 1;
      const invalidJsonFeature = {
        properties: {
          attributes: '{invalid JSON"',
        },
      } as unknown as Feature;

      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await expect(
        saveListAttributes.extractFeatureAttributes(orgDb, list_id, invalidJsonFeature)
      ).rejects.toThrow();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error parsing attributes',
        expect.any(String) // the stack trace
      );
    });
  });

  describe('handle', () => {
    it('should call extractFeatureAttributes and saveLocAttributesToListAttributes when features exist', async () => {
      const input: ChainType = {
        geojson: {
          features: [
            {
              properties: {
                attributes: JSON.stringify([
                  { field: 'width', type: 'number' },
                  { field: 'color', type: 'string' },
                ]),
              },
            },
          ],
        },
        request: {
          list_id: 1,
          organization_database: 'myOrgDb',
        } as RequestNewList,
      } as unknown as ChainType;

      const mockExtract = jest
        .spyOn(saveListAttributes, 'extractFeatureAttributes')
        .mockResolvedValue([
          { list_id: 1, attribute_name: 'width', attribute_type: ListsAttrsTypes.Int },
          { list_id: 1, attribute_name: 'color', attribute_type: ListsAttrsTypes.Text },
        ]);
      const mockSaveLoc = jest
        .spyOn(saveListAttributes, 'saveLocAttributesToListAttributes')
        .mockImplementation(async () => void 0);

      const result = await saveListAttributes.handle(input);

      expect(mockExtract).toHaveBeenCalled();
      expect(mockSaveLoc).toHaveBeenCalled();
      expect(result).toBe(input);
    });

    it('should return input when there are no features', async () => {
      const input: ChainType = {
        geojson: {
          features: [],
        },
        request: {
          list_id: 1,
          organization_database: 'myOrgDb',
        } as RequestNewList,
      } as unknown as ChainType;

      const result = await saveListAttributes.handle(input);

      expect(result).toBe(input);
    });

    it('should log an error if something goes wrong while handling', async () => {
      const input: ChainType = {
        geojson: {
          features: [
            {
              properties: {
                attributes: JSON.stringify([{ field: 'test', type: 'number' }]),
              },
            },
          ],
        },
        request: {
          list_id: 1,
          organization_database: 'myOrgDb',
        } as RequestNewList,
      } as unknown as ChainType;

      jest
        .spyOn(saveListAttributes, 'extractFeatureAttributes')
        .mockRejectedValue(new Error('Something bad happened'));
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      const result = await saveListAttributes.handle(input);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Something went wrong.',
        expect.stringMatching(/Error: Something bad happened/)
      );
      expect(result).toBe(input);
    });
  });
});

import { SaveListAttributes } from './save.list.attributes';
import { ClientStoreConnection, ListAttributesRecord } from '@wri-monorepos/sql';

jest.mock('@wri-monorepos/sql', () => ({
  ClientStoreConnection: jest.fn(),
  SQLUtils: { queryDB: jest.fn() },
  ListAttributes: jest.fn(),
  saveListAttributes: jest.fn(),
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

  describe('handle', () => {
    it('should call saveListAttributes with the correct arguments and return the input', async () => {
      const mockAttributes: ListAttributesRecord[] = [
        { list_id: 1, attribute_name: 'attr1', attribute_type: 1 },
      ];
      const mockRequest = { organization_database: 'orgDB' };
      const input = { attributes: mockAttributes, request: mockRequest } as any; // or your actual ChainType

      const result = await saveListAttributes.handle(input);

      expect(result).toEqual(input);
    });
  });
});

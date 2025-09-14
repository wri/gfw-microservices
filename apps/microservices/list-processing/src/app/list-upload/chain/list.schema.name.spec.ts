import { ListSchemaName } from './list.schema.name';
import { AbstractHandler, ChainType, RequestNewList } from './types';
import { getListByFilters } from '@wri-monorepos/sql';
import * as sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

jest.mock('@wri-monorepos/sql', () => ({
  getListByFilters: jest.fn(),
}));

describe('ListSchema', () => {
  let listSchema: ListSchemaName;
  let db: Database;

  beforeAll(async () => {
    db = await open({
      filename: ':memory:',
      driver: sqlite3.Database,
    });

    // Create necessary tables and seed data if needed
    await db.exec(`
      CREATE TABLE lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_name TEXT
      );
    `);
  });

  beforeEach(() => {
    listSchema = new ListSchemaName();
  });

  afterAll(async () => {
    await db.close();
  });

  it('should throw an error if list name already exists', async () => {
    const listName = 'TestList';

    await db.run(`INSERT INTO lists (list_name) VALUES (?)`, [listName]);

    (getListByFilters as jest.Mock).mockImplementation(async ({ listName }) => {
      const result = await db.get(`SELECT * FROM lists WHERE list_name = ?`, [listName]);
      return result ? true : false;
    });

    const input: ChainType = {
      request: {
        user_id: 1,
        list_name: listName,
        organization_database: 'test_db',
        path: 'test-path',
      },
    };

    await expect(listSchema.handle(input)).rejects.toThrow(`List name ${listName} already exists.`);
  });

  it('should handle accented characters in list name', async () => {
    const listName = 'Café List';
    const input: ChainType = {
      request: {
        user_id: 1,
        list_name: listName,
        organization_database: 'test_db',
        path: 'test-path',
        commodity: 'COCO',
        saveAsDraft: false,
      },
    };

    (getListByFilters as jest.Mock).mockResolvedValue(false);

    const response = await listSchema.handle(input);
    const request = response.request as RequestNewList;

    expect(request.listTable).toBe('list-cafelist');
    expect(request.analysisTable).toBe('analysis-cafelist');
  });

  it('should handle special characters in list name', async () => {
    const listName = 'Test-List_123';
    const input: ChainType = {
      request: {
        user_id: 1,
        list_name: listName,
        organization_database: 'test_db',
        path: 'test-path',
        commodity: 'COCO',
        saveAsDraft: false,
      },
    };

    (getListByFilters as jest.Mock).mockResolvedValue(false);

    const response = await listSchema.handle(input);
    const request = response.request as RequestNewList;

    expect(request.listTable).toBe('list-test-list_123');
    expect(request.analysisTable).toBe('analysis-test-list_123');
  });

  it('should remove periods from list name', async () => {
    const listName = 'Test.List.123';
    const input: ChainType = {
      request: {
        user_id: 1,
        list_name: listName,
        organization_database: 'test_db',
        path: 'test-path',
        commodity: 'COCO',
        saveAsDraft: false,
      },
    };

    (getListByFilters as jest.Mock).mockResolvedValue(false);

    const response = await listSchema.handle(input);
    const request = response.request as RequestNewList;

    expect(request.listTable).toBe('list-testlist123');
    expect(request.analysisTable).toBe('analysis-testlist123');
  });

  it('should preserve square brackets and parentheses in list name', async () => {
    const listName = 'Test[List](123)';
    const input: ChainType = {
      request: {
        user_id: 1,
        list_name: listName,
        organization_database: 'test_db',
        path: 'test-path',
        commodity: 'COCO',
        saveAsDraft: false,
      },
    };

    (getListByFilters as jest.Mock).mockResolvedValue(false);

    const response = await listSchema.handle(input);
    const request = response.request as RequestNewList;

    expect(request.listTable).toBe('list-test[list](123)');
    expect(request.analysisTable).toBe('analysis-test[list](123)');
  });

  it('should call super.handle with correct parameters if list name does not exist', async () => {
    const listName = 'NewList';

    (getListByFilters as jest.Mock).mockImplementation(async ({ listName }) => {
      const result = await db.get(`SELECT * FROM lists WHERE list_name = ?`, [listName]);
      return result ? true : false;
    });

    const input: ChainType = {
      request: {
        user_id: 1,
        list_name: listName,
        organization_database: 'test_db',
        path: 'test-path',
        commodity: 'COCO',
        saveAsDraft: false,
      },
    };

    const superHandleSpy = jest
      .spyOn(AbstractHandler.prototype, 'handle')
      .mockImplementation(() => Promise.resolve());

    const response = await listSchema.handle(input);

    expect(response).toStrictEqual({
      request: {
        analysisTable: 'analysis-newlist',
        commodity: 'COCO',
        customAttributeNames: '',
        customAttributeTypes: '',
        saveAsDraft: false,
        listTable: 'list-newlist',
        list_name: 'NewList',
        locationClassification: 'Property',
        organization_database: 'test_db',
        path: 'test-path',
        user_id: 1,
      },
    });

    superHandleSpy.mockRestore();
  });

  it('should not throw an error if validateList is false even if list name exists', async () => {
    const listName = 'TestList';

    await db.run(`INSERT INTO lists (list_name) VALUES (?)`, [listName]);

    (getListByFilters as jest.Mock).mockResolvedValue(true);

    const listSchemaNoValidate = new ListSchemaName(false);

    const input: ChainType = {
      request: {
        user_id: 1,
        list_name: listName,
        organization_database: 'test_db',
        path: 'test-path',
        commodity: 'COCO',
        saveAsDraft: false,
      },
    };

    const response = await listSchemaNoValidate.handle(input);
    const request = response.request as RequestNewList;

    expect(request.listTable).toBe('list-testlist');
    expect(request.analysisTable).toBe('analysis-testlist');
  });
});

import { ListSchemaName } from './list.schema.name';
import { AbstractHandler, ChainType } from './types';
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
        userId: 1,
        list_name: listName,
        organization_database: 'test-db',
        templateId: 1,
        path: 'path',
      },
    };

    await expect(listSchema.handle(input)).rejects.toThrow(`List name ${listName} already exists.`);
  });

  it('should call super.handle with correct parameters if list name does not exist', async () => {
    const listName = 'NewList';

    (getListByFilters as jest.Mock).mockImplementation(async ({ listName }) => {
      const result = await db.get(`SELECT * FROM lists WHERE list_name = ?`, [listName]);
      return result ? true : false;
    });

    const input: ChainType = {
      request: {
        userId: 1,
        list_name: listName,
        organization_database: 'test-db',
        templateId: 1,
        path: 'path',
      },
    };

    const superHandleSpy = jest
      .spyOn(AbstractHandler.prototype, 'handle')
      .mockImplementation(() => Promise.resolve());

    await listSchema.handle(input);

    expect(superHandleSpy).toHaveBeenCalledWith({
      ...input,
      request: {
        ...input.request,
        listTable: `list-${listName.toLowerCase()}`,
        analysisTable: `analysis-${listName.toLowerCase()}`,
        listStatusId: 1,
        locationClassification: 'Property',
        customAttributeNames: '',
        customAttributeTypes: '',
      },
    });

    superHandleSpy.mockRestore();
  });
});

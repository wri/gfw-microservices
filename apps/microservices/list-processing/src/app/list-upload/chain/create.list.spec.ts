import { SQLUtils } from '@wri-monorepos/sql';
import { CreateList } from './create.list';
import { updateListsUploadStatus } from '../shared/update.lists.upload.status';

jest.mock('@wri-monorepos/sql');
jest.mock('mssql');
jest.mock('../shared/update.lists.upload.status');

const mockExecuteQuery = jest.fn();
SQLUtils.prototype.executeQuery = mockExecuteQuery;

describe('CreateList', () => {
  let createList: CreateList;
  let input: any;

  beforeEach(() => {
    createList = new CreateList();
    input = {
      request: {
        list_name: 'Test List',
        organization_database: 'test_db',
        listTable: 'test_list_table',
        analysisTable: 'test_analysis_table',
        listStatusId: 1,
        locationClassification: 'test_classification',
        customAttributeNames: 'attr1,attr2',
        customAttributeTypes: 'type1,type2',
        gfwListId: 123,
        userId: 1,
        templateId: 1,
      },
    };

    mockExecuteQuery.mockResolvedValue({ list_id: 1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should insert a list and update the upload status', async () => {
    const mockConnect = jest.fn();
    SQLUtils.prototype.connect = mockConnect;

    await createList.handle(input);

    expect(mockConnect).toHaveBeenCalled();
    expect(mockExecuteQuery).toHaveBeenCalledWith('uspCreateList', expect.any(Array));
    expect(updateListsUploadStatus).toHaveBeenCalledWith(undefined, 1, 'Insert row in List table');
  });

  it('should throw an error if insertListInListTable fails', async () => {
    mockExecuteQuery.mockRejectedValue(new Error('SQL Error'));

    await expect(createList.handle(input)).rejects.toThrow(
      'Failed insert row in List Table: SQL Error'
    );
  });
});

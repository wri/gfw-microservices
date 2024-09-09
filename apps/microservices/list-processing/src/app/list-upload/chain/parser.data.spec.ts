import { ListSchema } from './list.schema';
import { getListByFilters } from '@wri-monorepos/sql';
import { AbstractHandler, ChainType } from './types';

// Mock the getListByFilters function
jest.mock('@wri-monorepos/sql', () => ({
  getListByFilters: jest.fn(),
}));

describe('ListSchema', () => {
  let listSchema: ListSchema;
  let mockInput: ChainType;

  beforeEach(() => {
    listSchema = new ListSchema();
    mockInput = {
      request: {
        list_name: 'Test List',
        organization_database: 'test_db',
        userId: 0,
        templateId: 0,
        path: ''
      },
    };
  });

  it('should throw an error if the list name already exists', async () => {
    // Mock the getListByFilters function to return a truthy value
    (getListByFilters as jest.Mock).mockResolvedValue(true);

    await expect(listSchema.handle(mockInput)).rejects.toThrow(
      'List name Test List already exists.'
    );
  });

  it('should call the super handle method with the correct parameters if the list name does not exist', async () => {
    // Mock the getListByFilters function to return a falsy value
    (getListByFilters as jest.Mock).mockResolvedValue(false);

    // Mock the super handle method
    const superHandleSpy = jest
      .spyOn(AbstractHandler.prototype, 'handle')
      .mockImplementation(() => Promise.resolve());

    await listSchema.handle(mockInput);

    expect(superHandleSpy).toHaveBeenCalledWith({
      ...mockInput,
      request: {
        ...mockInput.request,
        listTable: 'list-testlist',
        analysisTable: 'analysis-testlist',
        listStatusId: 1,
        locationClassification: 'Property',
        customAttributeNames: '',
        customAttributeTypes: '',
      },
    });

    // Restore the original implementation of the super handle method
    superHandleSpy.mockRestore();
  });
});

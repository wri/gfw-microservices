import { BulkDeleteLocations, DeleteList, UspSetListLocked } from '@wri-monorepos/sql';
import { ListHasFiltersApplies } from '@wri-monorepos/geo';
import { PutListAsDraft } from '../../list-upload/chain/put.list.as.draft';
import { handleSourceListDeletion } from './source.list.deletion';

jest.mock('@wri-monorepos/sql');
jest.mock('@wri-monorepos/geo');
jest.mock('../../list-upload/chain/put.list.as.draft');

describe('handleSourceListDeletion', () => {
  let mockPutListAsDraft: jest.Mocked<PutListAsDraft>;

  const mockParams = {
    clientDatabase: 'test-db',
    selectedListId: 123,
    userId: 456,
    gfwListId: 789,
    allLocationsSelected: false,
    filters: {
      country: 'USA',
      state: 'California',
      subState: 'Los Angeles',
      analysisAreaMin: 100,
      analysisAreaMax: 1000,
      searchString: 'test',
    },
    selectedLocations: ['loc1', 'loc2'],
    putListAsDraft: {} as PutListAsDraft,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPutListAsDraft = {
      putListAsDraft: jest.fn(),
    } as any;
    mockParams.putListAsDraft = mockPutListAsDraft;
  });

  it('should delete entire list when all locations are selected and no filters apply', async () => {
    // Arrange
    mockParams.allLocationsSelected = true;
    (ListHasFiltersApplies as jest.Mock).mockReturnValue(false);

    // Act
    await handleSourceListDeletion(mockParams);

    // Assert
    expect(UspSetListLocked.prototype.run).toHaveBeenCalledWith(
      mockParams.clientDatabase,
      mockParams.selectedListId,
      mockParams.userId
    );
    expect(DeleteList).toHaveBeenCalledWith(
      mockParams.clientDatabase,
      mockParams.selectedListId,
      mockParams.userId
    );
    expect(BulkDeleteLocations).not.toHaveBeenCalled();
    expect(mockPutListAsDraft.putListAsDraft).not.toHaveBeenCalled();
  });

  it('should delete specific locations when not all locations are selected', async () => {
    // Arrange
    mockParams.allLocationsSelected = false;

    // Act
    await handleSourceListDeletion(mockParams);

    // Assert
    expect(UspSetListLocked.prototype.run).toHaveBeenCalledWith(
      mockParams.clientDatabase,
      mockParams.selectedListId,
      mockParams.userId
    );
    expect(DeleteList).not.toHaveBeenCalled();
    expect(BulkDeleteLocations).toHaveBeenCalledWith(
      mockParams.clientDatabase,
      mockParams.selectedListId,
      mockParams.userId,
      mockParams.gfwListId,
      mockParams.selectedLocations.join()
    );
    expect(mockPutListAsDraft.putListAsDraft).toHaveBeenCalledWith(
      mockParams.clientDatabase,
      mockParams.selectedListId,
      mockParams.gfwListId
    );
  });

  it('should delete specific locations when all locations are selected but filters apply', async () => {
    // Arrange
    mockParams.allLocationsSelected = true;
    (ListHasFiltersApplies as jest.Mock).mockReturnValue(true);

    // Act
    await handleSourceListDeletion(mockParams);

    // Assert
    expect(UspSetListLocked.prototype.run).toHaveBeenCalledWith(
      mockParams.clientDatabase,
      mockParams.selectedListId,
      mockParams.userId
    );
    expect(DeleteList).not.toHaveBeenCalled();
    expect(BulkDeleteLocations).toHaveBeenCalledWith(
      mockParams.clientDatabase,
      mockParams.selectedListId,
      mockParams.userId,
      mockParams.gfwListId,
      null
    );
    expect(mockPutListAsDraft.putListAsDraft).toHaveBeenCalledWith(
      mockParams.clientDatabase,
      mockParams.selectedListId,
      mockParams.gfwListId
    );
  });
});

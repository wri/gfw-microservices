import { Test, TestingModule } from '@nestjs/testing';
import { AfiService } from './afi.service';
import { SQLUtils } from '@wri-monorepos/sql';
import * as sql from 'mssql';

jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDBFirstRow: jest.fn(),
    queryDB: jest.fn(),
  },
  getCountAfiAnalysisByListId: 'mock_count_query',
  getPaginatedAfiAnalysisListLevel: 'mock_list_level_query',
  getPaginatedAfiAnalysisLocationLevel: 'mock_location_level_query',
}));

describe('AfiService', () => {
  let service: AfiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AfiService],
    }).compile();

    service = module.get<AfiService>(AfiService);
    jest.clearAllMocks();
  });

  describe('getNumberOfPagesAfiAnalysis', () => {
    it('should return count data when query is successful', async () => {
      const mockResult = { id: 1, quantity: 10 };
      (SQLUtils.queryDBFirstRow as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.getNumberOfPagesAfiAnalysis('123', {
        isListLevel: 1,
        clientDatabase: 'test_db',
      });

      expect(result).toEqual(mockResult);
      expect(SQLUtils.queryDBFirstRow).toHaveBeenCalledWith('test_db', 'mock_count_query', [
        { field: 'listID', type: sql.Int, value: '123' },
        { field: 'isListLevel', type: sql.Int, value: 1 },
      ]);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database error');
      (SQLUtils.queryDBFirstRow as jest.Mock).mockRejectedValue(mockError);

      await expect(
        service.getNumberOfPagesAfiAnalysis('123', {
          isListLevel: 1,
          clientDatabase: 'test_db',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getAfiDataPerPage', () => {
    it('should return list level data when isListLevel is 1', async () => {
      const mockResult = [{ id: 1, name: 'Test' }];
      (SQLUtils.queryDB as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.getAfiDataPerPage('123', {
        isListLevel: 1,
        clientDatabase: 'test_db',
        rowsPerPage: 10,
        pageNumber: 1,
      });

      expect(result).toEqual(mockResult);
      expect(SQLUtils.queryDB).toHaveBeenCalledWith('test_db', 'mock_list_level_query', [
        { field: 'listId', type: sql.Int, value: '123' },
        { field: 'rowsOfPage', type: sql.Int, value: 10 },
        { field: 'pageNumber', type: sql.Int, value: 1 },
      ]);
    });

    it('should return location level data when isListLevel is 0', async () => {
      const mockResult = [{ id: 1, name: 'Test' }];
      (SQLUtils.queryDB as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.getAfiDataPerPage('123', {
        isListLevel: 0,
        clientDatabase: 'test_db',
        rowsPerPage: 10,
        pageNumber: 1,
      });

      expect(result).toEqual(mockResult);
      expect(SQLUtils.queryDB).toHaveBeenCalledWith('test_db', 'mock_location_level_query', [
        { field: 'listId', type: sql.Int, value: '123' },
        { field: 'rowsOfPage', type: sql.Int, value: 10 },
        { field: 'pageNumber', type: sql.Int, value: 1 },
      ]);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database error');
      (SQLUtils.queryDB as jest.Mock).mockRejectedValue(mockError);

      await expect(
        service.getAfiDataPerPage('123', {
          isListLevel: 1,
          clientDatabase: 'test_db',
          rowsPerPage: 10,
          pageNumber: 1,
        })
      ).rejects.toThrow('Database error');
    });
  });
});

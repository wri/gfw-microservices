import { createListAnalysis, updateListAnalysis } from './list.analysis.status';
import { ListsAnalysisStatus, SQLUtils } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';
import * as sql from 'mssql';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@wri-monorepos/sql', () => ({
  SQLUtils: {
    queryDB: jest.fn(),
  },
}));

jest.mock('@wri-monorepos/aws', () => ({
  S3Service: jest.fn(),
}));

jest.mock('@wri-monorepos/shared', () => ({
  readAnalysesLastModifiedTime: jest.fn(),
}));

describe('list.analysis.status.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createListAnalysis', () => {
    it("should call SQLUtils.queryDB for each analysisId except 'PalmRisk' and set 'options' for FCD if PalmRisk is included", async () => {
      const mockClientDB = 'myClientDb';
      const mockListId = 123;
      const mockAnalysisIds = ['FCD', 'SCI', 'PalmRisk'];
      const mockAnalysisStatus = 2;

      await createListAnalysis(mockClientDB, mockListId, mockAnalysisIds, mockAnalysisStatus);

      expect(SQLUtils.queryDB).toHaveBeenCalledTimes(2);
      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        mockClientDB,
        'uspCreateListAnalysisStatus',
        expect.arrayContaining([
          { field: 'ListID', type: sql.Int, value: mockListId },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'FCD' },
          { field: 'Status', type: sql.Int, value: mockAnalysisStatus },
          { field: 'options', type: sql.NVarChar(32), value: 'PalmRisk' },
        ])
      );

      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        mockClientDB,
        'uspCreateListAnalysisStatus',
        expect.arrayContaining([
          { field: 'ListID', type: sql.Int, value: mockListId },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'SCI' },
          { field: 'Status', type: sql.Int, value: mockAnalysisStatus },
        ])
      );
    });
  });

  describe('updateListAnalysis', () => {
    it('should delete existing analyses not in the new list, and create new analyses not in the existing list', async () => {
      const mockExistingStatusData: ListsAnalysisStatus[] = [
        { listId: 999, analysisId: 'FCD', status: 1 },
        { listId: 999, analysisId: 'GFW', status: 1 },
      ] as ListsAnalysisStatus[];

      const newAnalysisIds = ['FCD', 'SCI'];
      const mockClientDB = 'dbTest';
      const mockListId = 999;

      const createListAnalysisSpy = jest.spyOn(
        jest.requireActual('./list.analysis.status'),
        'createListAnalysis'
      );

      await updateListAnalysis(mockClientDB, mockListId, newAnalysisIds, mockExistingStatusData);

      expect(SQLUtils.queryDB).toHaveBeenCalledWith(
        mockClientDB,
        'dropListAnalysisStatusByListIdAndAnalysisIdQuery',
        expect.arrayContaining([
          { field: 'ListID', type: sql.Int, value: mockListId },
          { field: 'AnalysisID', type: sql.NVarChar(150), value: 'GFW' },
        ])
      );

      expect(createListAnalysisSpy).toHaveBeenCalledWith(
        mockClientDB,
        mockListId,
        ['SCI'],
        listStatus.Pending
      );

      expect(SQLUtils.queryDB).toHaveBeenCalledTimes(2);
      expect(createListAnalysisSpy).toHaveBeenCalledTimes(1);
    });
  });
});

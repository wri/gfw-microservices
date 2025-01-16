import { Logger } from '@nestjs/common';
import { ListsAnalysisStatus, SQLUtils } from '@wri-monorepos/sql';
import { listStatus } from '@wri-monorepos/constants';
import * as sql from 'mssql';

export const createListAnalysis = async (
  clientDatabase: string,
  listId: number,
  analysisIds: string[],
  analysisStatus: string | number
) => {
  try {
    const isPalmRiskIncluded = analysisIds.includes('PalmRisk');
    await Promise.all(
      analysisIds
        .filter((analysisId) => analysisId !== 'PalmRisk')
        .map(async (analysisId) => {
          const parameters = [
            {
              field: 'ListID',
              type: sql.Int,
              value: listId,
            },
            {
              field: 'AnalysisID',
              type: sql.NVarChar(150),
              value: analysisId,
            },
            {
              field: 'Status',
              type: sql.Int,
              value: analysisStatus,
            },
          ];

          if (isPalmRiskIncluded && analysisId === 'FCD') {
            parameters.push({
              field: 'options',
              type: sql.NVarChar(32),
              value: 'PalmRisk',
            });
          }

          return await SQLUtils.queryDB(clientDatabase, 'uspCreateListAnalysisStatus', parameters);
        })
    );
  } catch (error) {
    Logger.error('Create list analysis', error.stack || error);
    throw error;
  }
};

const deleteListAnalysis = async (clientDatabase, listId: number, analysisId: string) => {
  if (analysisId === 'PalmRisk') {
    analysisId = 'FCD';
  }
  await SQLUtils.queryDB(clientDatabase, 'dropListAnalysisStatusByListIdAndAnalysisIdQuery', [
    {
      field: 'ListID',
      type: sql.Int,
      value: listId,
    },
    {
      field: 'AnalysisID',
      type: sql.NVarChar(150),
      value: analysisId,
    },
  ]);
};

export const updateListAnalysis = async (
  clientDatabase,
  listId: number,
  analysisIds: string[],
  analysisStatusData: ListsAnalysisStatus[]
) => {
  const analysisDataIds = analysisStatusData.map((analysis) => analysis.analysisId);
  for (const analysisRow of analysisDataIds) {
    if (!analysisIds.includes(analysisRow)) {
      deleteListAnalysis(clientDatabase, listId, analysisRow);
    }
  }

  for (const element of analysisIds) {
    if (!analysisDataIds.includes(element)) {
      createListAnalysis(clientDatabase, listId, [element], listStatus.Pending);
    }
  }
};

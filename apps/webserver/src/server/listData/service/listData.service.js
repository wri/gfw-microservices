const path = require('path');
const { listStatus } = require(path.resolve('./config/env/listStatuses.constants'));
import {
  createListAnalysis,
  getListAnalysisStatusByListId,
  updateListAnalysis,
} from '@wri-monorepos/shared';

const setSelectedAnalyses = async (
  req,
  listId,
  analysisIds,
  analysisStatus = listStatus.Pending
) => {
  const { organization_database } = req.session;
  const analysisStatusData = await getListAnalysisStatusByListId(req, listId);
  if (
    analysisStatusData === undefined ||
    analysisStatusData === null ||
    analysisStatusData.length === 0
  ) {
    createListAnalysis(organization_database, listId, analysisIds, analysisStatus);
  } else {
    updateListAnalysis(organization_database, listId, analysisIds, analysisStatusData);
  }
};

export { setSelectedAnalyses };

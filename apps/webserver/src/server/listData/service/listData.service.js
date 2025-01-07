const path = require('path');
const { listStatus } = require(path.resolve('./config/env/listStatuses.constants'));
import * as sql from 'mssql';
const sqlUtils = require(path.resolve('./config/privateutils/sql.utils'));

import { getListAnalysisStatusById as getListAnalysisStatusByIdQuery } from '@wri-monorepos/sql';
import { createListAnalysis, updateListAnalysis } from '@wri-monorepos/geo';

const getListAnalysisStatusById = async (req, listId) => {
  const parameters = [{ field: 'listID', type: sql.Int, value: listId }];
  const [response] = await sqlUtils.executeOrganizationQuery(
    req,
    getListAnalysisStatusByIdQuery,
    parameters
  );
  return response;
};

const setSelectedAnalyses = async (
  req,
  listId,
  analysisIds,
  analysisStatus = listStatus.Pending
) => {
  const { organization_database } = req.session;
  const analysisStatusData = await getListAnalysisStatusById(req, listId);
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

export { setSelectedAnalyses, getListAnalysisStatusById };
